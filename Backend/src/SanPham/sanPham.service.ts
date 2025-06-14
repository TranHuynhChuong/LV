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
import { NhanVienService } from 'src/NguoiDung/NhanVien/nhanVien.service';
import { KhuyenMaiService } from 'src/KhuyenMai/khuyenMai.service';
import { TheLoaiService } from 'src/TheLoai/theLoai.service';

const folderPrefix = 'Products';

const typeOfChange: Record<string, string> = {
  TL_id: 'Thể loại',
  SP_trangThai: 'Trạng thái',
  SP_ten: 'Tên',
  SP_tomTat: 'Nội dung tóm tắt',
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
  SP_anh: 'Hình ảnh',
};

@Injectable()
export class SanPhamService {
  constructor(
    private readonly SanPham: SanPhamRepository,
    private readonly Transform: TransformService,
    private readonly Cloudinary: CloudinaryService,
    private readonly NhanVien: NhanVienService,
    private readonly KhuyenMai: KhuyenMaiService,
    private readonly TheLoai: TheLoaiService
  ) {}

  async create(
    data: CreateDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<SanPham> {
    const vector = await this.Transform.getTextEmbedding(data.SP_tomTat);
    const lastId = await this.SanPham.findLastId();
    const nextId = lastId + 1;

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: data.NV_id,
      thoiGian: new Date(),
    };

    const dataToSave: Partial<SanPham> = {
      ...data,
      SP_id: nextId,
      SP_eTomTat: vector,
      SP_anh: [],
      lichSuThaoTac: [thaoTac],
    };

    const created = await this.SanPham.create(dataToSave);
    if (!created) throw new BadRequestException();

    try {
      const uploadedImages = await this.handleImageUploads(
        nextId,
        coverImage,
        images
      );
      if (!uploadedImages.find((i) => i.A_anhBia)) {
        throw new BadRequestException();
      }

      const updated = await this.SanPham.update(nextId, {
        SP_anh: uploadedImages,
      });
      if (!updated) throw new Error();

      return updated;
    } catch {
      await this.SanPham.remove(nextId);
      await this.Cloudinary.deleteFolder(`${folderPrefix}/${nextId}`);
      throw new BadRequestException();
    }
  }

  async update(
    id: number,
    data: UpdateDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<SanPham> {
    const existing = await this.SanPham.findById(id);
    if (!existing) throw new BadRequestException();

    const vector =
      data.SP_tomTat && data.SP_tomTat !== existing.SP_tomTat
        ? await this.Transform.getTextEmbedding(data.SP_tomTat)
        : existing.SP_eTomTat;

    let newImages: AnhSP[] = [];

    if (images || coverImage) {
      try {
        newImages = await this.handleImageUploads(id, coverImage, images);
      } catch {
        throw new BadRequestException();
      }
    }

    const imagesToDelete = data.imagesToDelete ?? [];
    const remainingImages = existing.SP_anh.filter(
      (img) => !imagesToDelete.includes(img.A_url)
    );

    const allImages = [...remainingImages, ...newImages];

    const { fieldsChange, updatePayload } = this.detectChangedFields(
      data,
      existing
    );
    if (vector !== existing.SP_eTomTat) updatePayload.SP_eTomTat = vector;
    if (newImages.length) {
      updatePayload.SP_anh = allImages;
      fieldsChange.push('Cập nhật hình ảnh');
    }

    if (fieldsChange.length > 0 && data.NV_id) {
      updatePayload.lichSuThaoTac = [
        ...existing.lichSuThaoTac,
        {
          thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
          NV_id: data.NV_id,
          thoiGian: new Date(),
        },
      ];
    }

    if (Object.keys(updatePayload).length === 0) return existing;

    try {
      const updated = await this.SanPham.update(id, updatePayload);
      if (!updated) throw new Error();
      return updated;
    } catch {
      await this.rollbackUploadedImages(newImages);
      throw new BadRequestException();
    }
  }

  private async handleImageUploads(
    id: number,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<AnhSP[]> {
    const uploaded: AnhSP[] = [];

    if (coverImage) {
      const { uploaded: cover } = await this.Cloudinary.uploadSingleImage(
        id.toString(),
        coverImage,
        folderPrefix
      );
      uploaded.push({
        A_anhBia: true,
        A_publicId: cover.public_id,
        A_url: cover.url,
      });
    }

    if (images?.length) {
      const { uploaded: imgs } = await this.Cloudinary.uploadMultipleImages(
        id.toString(),
        images,
        folderPrefix
      );
      uploaded.push(
        ...imgs.map((img) => ({
          A_anhBia: false,
          A_publicId: img.public_id,
          A_url: img.url,
        }))
      );
    }

    return uploaded;
  }

  private detectChangedFields(
    data: UpdateDto,
    existing: SanPham
  ): { fieldsChange: string[]; updatePayload: Partial<SanPham> } {
    const fieldsChange: string[] = [];
    const updatePayload: Partial<SanPham> = {};

    for (const key of Object.keys(data)) {
      if (key === 'NV_id') continue;

      const newValue = data[key];
      const oldValue = existing[key];

      if (newValue === undefined) continue;

      const bothAreArrays = Array.isArray(newValue) && Array.isArray(oldValue);

      const hasChanged = bothAreArrays
        ? !this.areArraysEqual(newValue, oldValue)
        : newValue !== oldValue;

      if (hasChanged) {
        const label = typeOfChange[key];
        fieldsChange.push(label);
        updatePayload[key] = newValue;
      }
    }

    return { fieldsChange, updatePayload };
  }

  private areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  private async rollbackUploadedImages(images: AnhSP[]) {
    for (const img of images) {
      try {
        await this.Cloudinary.deleteImage(img.A_publicId);
      } catch {
        console.warn(`Không thể xóa ảnh đã upload: ${img.A_publicId}`);
      }
    }
  }

  async findAll(options: {
    page?: number;
    sortType?: number;
    filterType?: number;
    limit?: number;
  }): Promise<{
    data: any[];
    metadata: any;
  }> {
    const { page = 1, sortType = 1, filterType, limit = 24 } = options;

    const result = await this.SanPham.findAll(
      page,
      sortType,
      filterType,
      limit
    );

    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  async search(options: {
    page?: number;
    sortType?: number;
    filterType?: number;
    limit?: number;
    keyword?: string;
    categoryId?: number;
  }): Promise<{
    data: any[];
    metadata: any;
  }> {
    const {
      page = 1,
      sortType = 1,
      filterType,
      limit = 24,
      keyword,
      categoryId,
    } = options;

    const categoryIds = categoryId
      ? [categoryId, ...(await this.TheLoai.findAllChildren(categoryId))]
      : undefined;

    const result = await this.SanPham.search(
      page,
      sortType,
      filterType,
      limit,
      keyword,
      categoryIds
    );

    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  async searchAutocomplete(keyword: string): Promise<string[]> {
    return this.SanPham.searchAutocomplete(keyword);
  }

  // Tìm sản phẩm tương tự theo embedding vector
  async findByVector(queryText: string, limit: number) {
    const queryVector = await this.Transform.getTextEmbedding(queryText);
    return this.SanPham.findByVector(queryVector, limit);
  }

  async findById(
    id: number,
    mode: 'default' | 'full' | 'search' = 'default',
    filterType?: number
  ): Promise<{ product: any; promotion: any }> {
    const result: any = await this.SanPham.findById(id, mode, filterType);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    const promotion = await this.KhuyenMai.getValidChiTietKhuyenMai([
      result.SP_id,
    ]);

    return { product: result, promotion: promotion };
  }

  async findByIds(ids: number[]): Promise<{
    products: Partial<SanPham>[];
    promotions: any[];
  }> {
    const result: any = await this.SanPham.findByIds(ids);
    if (!result) {
      throw new NotFoundException();
    }

    const promotions = await this.KhuyenMai.getValidChiTietKhuyenMai(ids);

    return { products: result, promotions: promotions };
  }

  async delete(id: number): Promise<SanPham> {
    const deleted = await this.SanPham.delete(id);
    if (!deleted) {
      throw new NotFoundException();
    }
    return deleted;
  }

  async countAll(): Promise<{
    total: number;
    live: number;
    hidden: number;
    outOfStock: number;
  }> {
    return this.SanPham.countAll();
  }
}
