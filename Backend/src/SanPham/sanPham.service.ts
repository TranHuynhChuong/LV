import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SanPhamRepository, SanPhamSummary } from './sanPham.repository';
import { TransformService } from '../Util/transform.service';
import { SanPham, AnhSP, LichSuThaoTacSP } from './sanPham.schema';
import { CloudinaryService } from 'src/Util/cloudinary.service';
import { CreateDto, UpdateDto } from './sanPham.dto';
import { ThaoTac } from 'src/NguoiDung/NhanVien/nhanVien.service';
import { NhanVienRepository } from 'src/NguoiDung/NhanVien/nhanVien.repository';

const folderPrefix = 'Products';

const typeOfChange: Record<string, string> = {
  TL_id: 'Thể loại',
  SP_trangThai: 'Trạng thái',
  SP_ten: 'Tên',
  SP_noiDung: 'Nội dung tóm tắt',
  SP_moTa: 'Mô tả',
  SP_tacGia: 'Tác giả',
  SP_nhaXuaBan: 'Nhà xuất bản',
  SP_ngonNgu: 'Ngôn ngữ',
  SP_nguoiDich: 'Người dịch',
  SP_namXuatBan: 'Năm xuất bản',
  SP_soTrang: 'Số trang',
  SP_isbn: 'ISBN',
  SP_giaBan: 'Giá bán',
  SP_giaNhap: 'Giá nhập',
  SP_tonKho: 'Tồn kho',
  SP_trongLuong: 'Trọng lượng',
  SP_anh: 'Ảnh',
};

@Injectable()
export class SanPhamService {
  constructor(
    private readonly SanPham: SanPhamRepository,
    private readonly Transform: TransformService,
    private readonly Cloudinary: CloudinaryService,
    private readonly NhanVien: NhanVienRepository
  ) {}

  async create(
    data: CreateDto,
    coverImage?: Express.Multer.File,
    Images?: Express.Multer.File[]
  ): Promise<SanPham> {
    // Tạo vector embedding
    const vector = await this.Transform.getTextEmbedding(data.SP_noiDung);

    // Lấy id mới cho sản phẩm
    const lastId = await this.SanPham.findLastId();
    const nextId = lastId + 1;

    // Mảng ảnh sản phẩm
    const images: AnhSP[] = [];

    // Upload ảnh bìa
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

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: data.NV_id,
      thoiGian: new Date(),
    };

    // Dữ liệu để tạo sản phẩm
    const dataToSave: Partial<SanPham> = {
      ...data,
      SP_id: nextId,
      SP_eNoiDung: vector,
      SP_anh: images,
      lichSuThaoTac: [thaoTac],
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
    if (!existing) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const images: AnhSP[] = [];

    // Nếu có nội dung mới thì tạo lại vector
    const vector =
      data.SP_noiDung && data.SP_noiDung !== existing.SP_noiDung
        ? await this.Transform.getTextEmbedding(data.SP_noiDung)
        : existing.SP_eNoiDung;

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

    // Upload nhiều ảnh thường nếu có
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

    const allImages = [...existing.SP_anh, ...images];

    // So sánh và xác định trường có thay đổi
    const fieldsChange: string[] = [];
    const updatePayload: Partial<SanPham> = {};

    for (const key of Object.keys(data)) {
      if (
        data[key] !== undefined &&
        data[key] !== existing[key] &&
        key !== 'NV_id'
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = data[key];
      }
    }

    // Nếu có vector mới (do nội dung thay đổi)
    if (vector !== existing.SP_eNoiDung) {
      updatePayload.SP_eNoiDung = vector;
    }

    // Nếu có ảnh mới
    if (images.length > 0) {
      updatePayload.SP_anh = allImages;
      fieldsChange.push('Hình ảnh');
    }

    // Thêm lịch sử thao tác nếu có thay đổi
    if (fieldsChange.length > 0 && data.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: data.NV_id,
        thoiGian: new Date(),
      };
      updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    }

    // Nếu không có gì thay đổi => trả lại luôn
    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }

    const updated = await this.SanPham.update(id, updatePayload);
    if (!updated) throw new BadRequestException('Cập nhật thất bại');

    return updated;
  }

  async findAll(
    cursorId: string,
    currentPage: number,
    targetPage: number,
    sortType: 1 | 2 | 3 = 1,
    filterType: 1 | 2 | 12 = 12,
    limit = 24
  ): Promise<{ total: number; data: SanPhamSummary[] } | undefined> {
    const skip = Math.abs(targetPage - currentPage);

    if (skip === 0) {
      return;
    } // Không cần gọi gì nếu không đổi trang

    const direction = targetPage > currentPage ? 'forward' : 'back';
    const total = await this.SanPham.count(filterType);

    if (direction === 'forward') {
      const data = await this.SanPham.findAllForward(
        cursorId,
        skip,
        limit,
        sortType,
        filterType
      );
      return { total, data };
    } else {
      const data = await this.SanPham.findAllBack(
        cursorId,
        skip,
        limit,
        sortType,
        filterType
      );
      return { total, data };
    }
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
    const lichSu = result.lichSuThaoTac || [];

    const ids = [
      ...new Set(
        lichSu.map((item: LichSuThaoTacSP) => item.NV_id).filter(Boolean)
      ),
    ] as string[];
    const nhanViens = await this.NhanVien.findAllIds(ids);
    const nhanVienMap = new Map<string, any>();
    nhanViens.forEach((nv) => {
      nhanVienMap.set(nv.NV_id, nv);
    });

    result.lichSuThaoTac = lichSu.map((item): ThaoTac => {
      const nv = nhanVienMap.get(item.NV_id);

      return {
        thoiGian: item.thoiGian,
        thaoTac: item.thaoTac,
        nhanVien: {
          NV_id: nv?.NV_id ?? null,
          NV_hoTen: nv?.NV_hoTen ?? null,
          NV_email: nv?.NV_email ?? null,
          NV_soDienThoai: nv?.NV_soDienThoai ?? null,
        },
      };
    });
    return result;
  }

  async delete(id: number): Promise<SanPham> {
    const deleted = await this.SanPham.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với SP_id = ${id}`);
    }
    return deleted;
  }

  async countAll(): Promise<{ total: number; show: number; hidden: number }> {
    return this.SanPham.countAll();
  }
}
