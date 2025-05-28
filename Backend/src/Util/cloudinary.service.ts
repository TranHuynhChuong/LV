import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  private uploadStreamAsync(
    file: Express.Multer.File,
    options: Record<string, any>
  ): Promise<{ public_id: string; url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException('Lỗi tải ảnh lên Cloudinary')
            );
          }
          resolve({ public_id: result.public_id, url: result.url });
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadSingleImage(
    targetId: string,
    file: Express.Multer.File,
    folderPrefix: string,
    convertToWebP = true
  ): Promise<{ uploaded: { public_id: string; url: string } }> {
    if (!file) throw new BadRequestException();

    try {
      const options: Record<string, any> = {
        folder: `${folderPrefix}/${targetId}`,
      };

      if (convertToWebP) {
        options.transformation = [{ format: 'webp' }];
      }

      const uploaded = await this.uploadStreamAsync(file, options);
      return { uploaded };
    } catch (error) {
      console.error('[CloudinaryService] uploadSingleImage error:', error);
      throw error;
    }
  }

  async uploadMultipleImages(
    targetId: string,
    files: Express.Multer.File[],
    folderPrefix: string
  ): Promise<{ uploaded: { public_id: string; url: string }[] }> {
    if (!files?.length) throw new BadRequestException();

    try {
      const options = { folder: `${folderPrefix}/${targetId}` };

      const uploaded = await Promise.all(
        files.map((file) => this.uploadStreamAsync(file, options))
      );

      return { uploaded };
    } catch (error) {
      console.error('[CloudinaryService] uploadMultipleImages error:', error);
      throw new InternalServerErrorException('Không thể tải ảnh lên');
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const { resources } = (await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
      })) as { resources: { public_id: string }[] };

      if (resources.length > 0) {
        const publicIds = resources.map(
          (r: { public_id: string }) => r.public_id
        );
        await cloudinary.api.delete_resources(publicIds);
      }

      await cloudinary.api.delete_folder(folderPath);
    } catch (error) {
      console.error(
        `[CloudinaryService] deleteFolder(${folderPath}) error:`,
        error
      );
      throw new InternalServerErrorException(`Lỗi xóa thư mục ${folderPath}`);
    }
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds?.length) return;

    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('[CloudinaryService] deleteImages error:', error);
      throw new InternalServerErrorException('Không thể xóa ảnh');
    }
  }
}
