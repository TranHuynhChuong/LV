import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SanPhamRepository } from './sanPham.repository';
import { TransformService } from '../Util/transform.service';
import { SanPham, AnhSP } from './sanPham.schema';
import { CloudinaryService } from 'src/Util/cloudinary.service';
import { CreateDto, UpdateDto } from './sanPham.dto';
import {
  NhanVienInfo,
  NhanVienService,
} from 'src/NguoiDung/NhanVien/nhanVien.service';
const folderPrefix = 'Products';
@Injectable()
export class SanPhamService {
  constructor(
    private readonly SanPham: SanPhamRepository,
    private readonly Transform: TransformService,
    private readonly Cloudinary: CloudinaryService,
    private readonly NhanVien: NhanVienService
  ) {}

  async create(
    data: CreateDto,
    coverImage?: Express.Multer.File,
    Images?: Express.Multer.File[]
  ): Promise<SanPham> {
    // Tạo vector embedding - dữ liệu đã được kiểm tra yêu cầu ở dto
    const vector = await this.Transform.getTextEmbedding(data.SP_noiDung);

    // Lấy id mới cho sản phẩm
    const lastId = await this.SanPham.findLastId();
    const nextId = lastId + 1;

    // Mảng ảnh sản phẩm
    const images: AnhSP[] = [];

    // Upload ảnh bìa - dữ liệu đã được kiểm tra đầu vào
    if (!coverImage) {
      throw new BadRequestException();
    }

    const { uploaded } = await this.Cloudinary.uploadSingleImage(
      nextId.toString(),
      coverImage,
      folderPrefix
    );

    images.push({
      A_anhBia: true,
      A_publicId: uploaded.public_id,
      A_url: uploaded.url,
    });

    // Upload nhiều ảnh thường - có thể có hoặc không
    if (Images && Images.length > 0) {
      const { uploaded } = await this.Cloudinary.uploadMultipleImages(
        nextId.toString(),
        Images,
        folderPrefix
      );

      // uploaded là mảng các ảnh trả về
      for (const img of uploaded) {
        images.push({
          A_anhBia: false,
          A_publicId: img.public_id,
          A_url: img.url,
        });
      }
    }

    // Dữ liệu để tạo sản phẩm
    const dataToSave: Partial<SanPham> = {
      ...data,
      SP_id: nextId,
      SP_eNoiDung: vector,
      SP_anh: images,
    };

    const create = await this.SanPham.create(dataToSave);

    if (!create) {
      throw new BadRequestException();
    }
    return create;
  }

  async update(
    id: number,
    data: UpdateDto,
    coverImage?: Express.Multer.File,
    Images?: Express.Multer.File[]
  ): Promise<SanPham> {
    const existing = await this.SanPham.findById(id);
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm');

    const images: AnhSP[] = [];

    // Nếu có nội dung mới => tạo lại vector
    let vector = existing.SP_eNoiDung;
    if (data.SP_noiDung) {
      vector = await this.Transform.getTextEmbedding(data.SP_noiDung);
    }

    // Upload ảnh bìa mới nếu có
    if (coverImage) {
      const { uploaded } = await this.Cloudinary.uploadSingleImage(
        id.toString(),
        coverImage,
        id.toString()
      );

      images.push({
        A_anhBia: true,
        A_publicId: uploaded.public_id,
        A_url: uploaded.url,
      });
    }

    // Upload thêm ảnh thường nếu có
    if (Images?.length) {
      const { uploaded } = await this.Cloudinary.uploadMultipleImages(
        id.toString(),
        Images,
        id.toString()
      );

      for (const img of uploaded) {
        images.push({
          A_anhBia: false,
          A_publicId: img.public_id,
          A_url: img.url,
        });
      }
    }

    // Gộp ảnh cũ + mới (hoặc chỉ mới nếu muốn thay thế)
    const allImages = [...existing.SP_anh, ...images];

    const updatedData: Partial<SanPham> = {
      ...data,
      SP_eNoiDung: vector,
      ...(images.length > 0 && { SP_anh: allImages }),
    };

    const updated = await this.SanPham.update(id, updatedData);
    if (!updated) throw new BadRequestException();

    return updated;
  }

  // Lấy tất cả sản phẩm với phân trang và lọc trạng thái
  async findAll(
    page: number,
    limit: number,
    filterType: 1 | 2 | 12 = 12
  ): Promise<{ data: SanPham[]; total: number }> {
    return this.SanPham.findAll(page, limit, filterType);
  }

  // Tìm sản phẩm theo tên (text search)
  async findByName(keyword: string, limit: number, page: number) {
    return this.SanPham.findByName(keyword, page, limit);
  }

  // Tìm sản phẩm tương tự theo embedding vector
  async findByVector(queryText: string, limit: number) {
    const queryVector = await this.Transform.getTextEmbedding(queryText);
    return this.SanPham.findByVector(queryVector, limit);
  }

  async findById(id: number): Promise<any> {
    const result: any = await this.SanPham.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    let nhanVien: NhanVienInfo = {
      NV_id: result.NV_id,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (result.NV_id) {
      const staff = await this.NhanVien.findById(result.NV_id);
      if (staff) {
        nhanVien = {
          NV_id: staff.NV_id,
          NV_hoTen: staff.NV_hoTen,
          NV_email: staff.NV_email,
          NV_soDienThoai: staff.NV_soDienThoai,
        };
        result.NV_id = nhanVien;
      }
    }
    return result;
  }

  async delete(id: number): Promise<SanPham> {
    const deleted = await this.SanPham.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với SP_id = ${id}`);
    }
    return deleted;
  }

  async countAll(): Promise<number> {
    return this.SanPham.countAll();
  }
}
