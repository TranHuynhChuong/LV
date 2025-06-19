import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SanPhamRepository } from './sanPham.repository';
import { TransformService } from '../Util/transform.service';
import { SanPham, AnhSP } from './sanPham.schema';
import { CloudinaryService } from 'src/Util/cloudinary.service';
import { CreateDto, UpdateDto } from './sanPham.dto';
import { NhanVienUtilService } from 'src/NguoiDung/NhanVien/nhanVien.service';
import { TheLoaiUtilService } from 'src/TheLoai/theLoai.service';

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
export class SanPhamUtilService {
  constructor(private readonly SanPham: SanPhamRepository) {}

  async findByIds(ids: number[]): Promise<any[]> {
    const result = await this.SanPham.findByIds(ids);
    if (!result || result.length === 0) {
      throw new NotFoundException();
    }

    return result;
  }

  async findInCategories(ids: number[]) {
    return this.SanPham.findInCategories(ids);
  }
}

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class SanPhamService {
  constructor(
    private readonly SanPham: SanPhamRepository,
    private readonly Transform: TransformService,
    private readonly Cloudinary: CloudinaryService,
    private readonly NhanVien: NhanVienUtilService,

    @Inject(forwardRef(() => TheLoaiUtilService))
    private readonly TheLoai: TheLoaiUtilService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async create(
    data: CreateDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<SanPham> {
    const session = await this.connection.startSession();
    let nextId: number = 0;
    try {
      let finalResult: SanPham;
      await session.withTransaction(async () => {
        const vector = await this.Transform.getTextEmbedding(data.SP_tomTat);
        const lastId = await this.SanPham.findLastId(session);
        nextId = lastId + 1;

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

        const created = await this.SanPham.create(dataToSave, session);
        if (!created) throw new BadRequestException();

        const uploadedImages = await this.handleImageUploads(
          nextId,
          coverImage,
          images
        );
        if (!uploadedImages.find((i) => i.A_anhBia)) {
          throw new BadRequestException('Thiếu ảnh bìa');
        }

        const updated = await this.SanPham.update(
          nextId,
          { SP_anh: uploadedImages },
          session
        );
        if (!updated) throw new Error();

        finalResult = updated;
      });

      await session.endSession();
      return finalResult!;
    } catch (error) {
      await session.endSession();
      if (nextId !== 0) {
        await this.Cloudinary.deleteFolder(`${folderPrefix}/${nextId}`);
      }
      throw error;
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

    if (Object.keys(updatePayload).length === 0) return existing as SanPham;

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
  ): Promise<any> {
    const result: any = await this.SanPham.findById(id, mode, filterType);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    if (mode === 'full') {
      const SP_tuongTuRaw = await this.SanPham.findByVector(
        result.SP_eTomTat,
        11
      );

      // Lọc bỏ sản phẩm trùng id
      const SP_tuongTu = SP_tuongTuRaw.filter((sp) => sp.SP_id !== id);

      delete result.SP_eTomTat;

      return { ...result, SP_tuongTu };
    } else return result;
  }

  async delete(id: number, NV_id: string): Promise<SanPham> {
    const existing = await this.SanPham.findById(id);
    if (!existing) throw new BadRequestException();

    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };

    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];

    const deleted = await this.SanPham.update(id, {
      SP_trangThai: 0,
      lichSuThaoTac: lichSuThaoTac,
    });
    if (!deleted) {
      throw new NotFoundException();
    }
    return deleted;
  }

  async countAll(): Promise<{
    live: { total: number; in: number; out: number };
    hidden: { total: number; in: number; out: number };
  }> {
    return this.SanPham.countAll();
  }
}
