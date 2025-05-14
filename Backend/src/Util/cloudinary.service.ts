import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  // Upload một ảnh
  async uploadSingleImage(
    targetId: string,
    file: Express.Multer.File,
    folderPrefix: string,
    convertToWebP: boolean = true
  ): Promise<{ uploaded: { public_id: string; url: string } }> {
    if (!file) throw new BadRequestException('Không có file được cung cấp');

    try {
      const options: any = {
        folder: `${folderPrefix}/${targetId}`,
        public_id: `${targetId}`,
      };

      // Nếu cần chuyển ảnh sang WebP, thêm tham số transformation vào options
      if (convertToWebP) {
        options.transformation = [
          {
            format: 'webp',
          },
        ];
      }

      const uploaded = await new Promise<{ public_id: string; url: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
              if (error) {
                return reject(
                  new InternalServerErrorException('Lỗi tải ảnh lên Cloudinary')
                );
              }
              resolve({ public_id: result!.public_id, url: result!.url });
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        }
      );
      return { uploaded };
    } catch (error) {
      console.error('[CloudinaryService] Lỗi tải ảnh:', error);
      throw new InternalServerErrorException('Không thể tải ảnh');
    }
  }

  // Upload nhiều ảnh
  async uploadMultipleImages(
    targetId: string,
    files: Express.Multer.File[],
    folderPrefix: string
  ): Promise<{ uploaded: { public_id: string; url: string }[] }> {
    if (!files || files.length === 0)
      throw new BadRequestException('Không có file nào được cung cấp');

    try {
      const uploadPromises = files.map(
        (file) =>
          new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: `${folderPrefix}/${targetId}` },
              (error, result) => {
                if (error) {
                  return reject(
                    new InternalServerErrorException(
                      'Lỗi tải ảnh lên Cloudinary'
                    )
                  );
                }
                if (result) {
                  resolve(result);
                } else {
                  reject(
                    new InternalServerErrorException(
                      'Cloudinary upload returned undefined result'
                    )
                  );
                }
              }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          })
      );

      const uploadResults = await Promise.all(uploadPromises);
      const uploaded = uploadResults
        .filter(
          (img): img is UploadApiResponse => 'public_id' in img && 'url' in img
        )
        .map((img) => ({ public_id: img.public_id, url: img.url }));

      return { uploaded };
    } catch (error) {
      console.error('[CloudinaryService] Error uploading images:', error);
      throw error;
    }
  }

  // Xóa toàn bộ folder (và ảnh trong đó)
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
      });

      if (resources.length > 0) {
        const publicIds = resources.map(
          (file: { public_id: string }) => file.public_id
        );
        await cloudinary.api.delete_resources(publicIds);
      }

      await cloudinary.api.delete_folder(folderPath);
    } catch (error) {
      console.error(
        `[CloudinaryService] Error deleting folder ${folderPath}:`,
        error
      );
      throw new InternalServerErrorException(`Lỗi xóa thư mục ${folderPath}`);
    }
  }

  // Xóa danh sách ảnh theo public_id
  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) return;

    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('[CloudinaryService] Error deleting images:', error);
      throw new InternalServerErrorException('Không thể xóa ảnh');
    }
  }
}
