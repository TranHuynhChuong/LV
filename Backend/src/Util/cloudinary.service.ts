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

  /**
   * Tải tệp lên Cloudinary sử dụng luồng (stream).
   *
   * @param file - Tệp được truyền từ client thông qua middleware Multer.
   * @param options - Các tùy chọn cấu hình cho việc tải lên (ví dụ: folder, tags,...).
   * @returns Một Promise chứa `public_id` và `url` của tệp đã tải lên.
   * @throws InternalServerErrorException nếu quá trình tải lên thất bại.
   */
  private uploadStreamAsync(
    file: Express.Multer.File,
    options: Record<string, any>
  ): Promise<{ public_id: string; url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { ...options, secure: true },
        (error, result) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException('Lỗi tải ảnh lên Cloudinary')
            );
          }
          resolve({ public_id: result.public_id, url: result.secure_url });
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Tải lên một ảnh đơn lẻ lên Cloudinary, có thể chuyển đổi sang định dạng WebP.
   *
   * @param targetId - ID của đối tượng đích (ví dụ: sản phẩm, người dùng, v.v.).
   * @param file - Tệp ảnh được truyền từ phía client.
   * @param folderPrefix - Tên thư mục trên Cloudinary để lưu ảnh.
   * @param convertToWebP - Có chuyển sang định dạng WebP hay không (mặc định: true).
   * @returns Thông tin ảnh đã tải lên bao gồm `public_id` và `url`.
   * @throws BadRequestException nếu không có tệp hoặc tệp không hợp lệ.
   */
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

  /**
   * Tải lên nhiều ảnh lên Cloudinary cho một đối tượng cụ thể.
   *
   * @param targetId - ID của đối tượng đích (ví dụ: sản phẩm, người dùng, v.v.).
   * @param files - Mảng tệp ảnh được truyền từ phía client.
   * @param folderPrefix - Tên thư mục gốc để lưu ảnh trên Cloudinary.
   * @returns Danh sách thông tin ảnh đã tải lên bao gồm `public_id` và `url`.
   * @throws BadRequestException nếu danh sách tệp rỗng hoặc không hợp lệ.
   */
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

  /**
   * Xoá toàn bộ nội dung của một thư mục trên Cloudinary, bao gồm các ảnh và thư mục con.
   *
   * @param folderPath - Đường dẫn đầy đủ tới thư mục cần xoá trên Cloudinary (ví dụ: 'products/123').
   * @throws InternalServerErrorException nếu xảy ra lỗi trong quá trình xoá thư mục.
   */
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

  /**
   * Xoá nhiều ảnh khỏi Cloudinary theo danh sách public_id cung cấp.
   *
   * @param publicIds - Mảng các `public_id` của ảnh cần xoá trên Cloudinary.
   * @throws InternalServerErrorException nếu có lỗi xảy ra trong quá trình xoá ảnh.
   */
  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds?.length) return;
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('[CloudinaryService] deleteImages error:', error);
      throw new InternalServerErrorException('Không thể xóa ảnh');
    }
  }

  /**
   * Xoá một ảnh duy nhất trên Cloudinary thông qua `public_id`.
   *
   * @param publicId - Mã định danh duy nhất (`public_id`) của ảnh trên Cloudinary.
   * @throws InternalServerErrorException nếu có lỗi xảy ra trong quá trình xoá ảnh.
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    try {
      await cloudinary.api.delete_resources([publicId]);
    } catch (error) {
      console.error('[CloudinaryService] deleteImage error:', error);
      throw new InternalServerErrorException('Không thể xóa ảnh');
    }
  }
}
