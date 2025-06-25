import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProductFilterType,
  ProductSortType,
  SanPhamRepository,
} from './repositories/san-pham.repository';
import { TransformService } from '../Util/transform.service';
import { SanPham, AnhSP, ProductStatus } from './schemas/san-pham.schema';
import { CloudinaryService } from 'src/Util/cloudinary.service';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';
import { TheLoaiUtilService } from 'src/the-loai/the-loai.service';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { CreateSanPhamDto } from './dto/create-san-pham.dto';
import { UpdateSanPhamDto } from './dto/update-san-pham.dto';

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
  constructor(private readonly SanPhamRepo: SanPhamRepository) {}

  async findByIds(ids: number[]): Promise<any[]> {
    const result = await this.SanPhamRepo.findAllShowByIds(ids);
    return result;
  }

  async findInCategories(ids: number[]) {
    return this.SanPhamRepo.findInCategories(ids);
  }

  async updateSold(
    updates: { id: string; sold: number }[],
    session: ClientSession
  ) {
    const result = await this.SanPhamRepo.updateSold(updates, session);

    if (result.modifiedCount < updates.length) {
      throw new NotFoundException(
        'Cập nhật bán hàng - Có sản phẩm không tồn tại'
      );
    }

    return result;
  }
}

@Injectable()
export class SanPhamService {
  constructor(
    private readonly SanPhamRepo: SanPhamRepository,
    private readonly TransformService: TransformService,
    private readonly CloudinaryService: CloudinaryService,
    private readonly NhanVienService: NhanVienUtilService,

    @Inject(forwardRef(() => TheLoaiUtilService))
    private readonly TheLoai: TheLoaiUtilService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async create(
    data: CreateSanPhamDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<SanPham> {
    const session = await this.connection.startSession();
    let nextId: number = 0;
    try {
      let finalResult: SanPham;
      await session.withTransaction(async () => {
        const vector = await this.TransformService.getTextEmbedding(
          data.SP_tomTat
        );
        const lastId = await this.SanPhamRepo.findLastId(session);
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

        const created = await this.SanPhamRepo.create(dataToSave, session);
        if (!created)
          throw new BadRequestException('Tạo sản phẩm - Tạo sản phẩm thất bại');

        const uploadedImages = await this.handleImageUploads(
          nextId,
          coverImage,
          images
        );
        if (!uploadedImages.find((i) => i.A_anhBia)) {
          throw new BadRequestException('Tạo sản phẩm - Thiếu ảnh bìa');
        }

        const updated = await this.SanPhamRepo.update(
          nextId,
          { SP_anh: uploadedImages },
          session
        );
        if (!updated) throw new Error('Tạo sản phẩm - Lỗi tải ảnh');

        finalResult = updated;
      });

      await session.endSession();
      return finalResult!;
    } catch (error) {
      await session.endSession();
      if (nextId !== 0) {
        await this.CloudinaryService.deleteFolder(`${folderPrefix}/${nextId}`);
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async update(
    id: number,
    data: UpdateSanPhamDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<SanPham> {
    const existing = await this.SanPhamRepo.findById(id);
    if (!existing)
      throw new NotFoundException('Cập nhật sản phẩm - Không tồn tại sản phẩm');

    const vector =
      data.SP_tomTat && data.SP_tomTat !== existing.SP_tomTat
        ? await this.TransformService.getTextEmbedding(data.SP_tomTat)
        : existing.SP_eTomTat;

    let newImages: AnhSP[] = [];

    if (images || coverImage) {
      try {
        newImages = await this.handleImageUploads(id, coverImage, images);
      } catch {
        throw new BadRequestException(
          'Cập nhật sản phẩm - Không thể cập nhật ảnh'
        );
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
      const updated = await this.SanPhamRepo.update(id, updatePayload);
      if (!updated) throw new Error();
      return updated;
    } catch {
      await this.rollbackUploadedImages(newImages);
      throw new BadRequestException(
        'Cập nhật sản phẩm - Cập nhật sản phẩm thất bại'
      );
    }
  }

  private async handleImageUploads(
    id: number,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<AnhSP[]> {
    const uploaded: AnhSP[] = [];

    if (coverImage) {
      const { uploaded: cover } =
        await this.CloudinaryService.uploadSingleImage(
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
      const { uploaded: imgs } =
        await this.CloudinaryService.uploadMultipleImages(
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
    data: UpdateSanPhamDto,
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
        await this.CloudinaryService.deleteImage(img.A_publicId);
      } catch {
        console.warn(`Không thể xóa ảnh đã upload: ${img.A_publicId}`);
      }
    }
  }

  async findAll(options: {
    page?: number;
    sortType?: ProductSortType;
    filterType?: ProductFilterType;
    limit?: number;
  }) {
    const {
      page = 1,
      sortType = ProductSortType.Latest,
      filterType,
      limit = 24,
    } = options;

    const result = await this.SanPhamRepo.findAll(
      page,
      sortType,
      filterType,
      limit
    );

    return result;
  }

  async search(options: {
    page?: number;
    sortType?: ProductSortType;
    filterType?: ProductFilterType;
    limit?: number;
    keyword?: string;
    categoryId?: number;
  }) {
    const {
      page = 1,
      sortType = ProductSortType.Latest,
      filterType,
      limit = 24,
      keyword,
      categoryId,
    } = options;

    const categoryIds = categoryId
      ? [categoryId, ...(await this.TheLoai.findAllChildren(categoryId))]
      : undefined;

    const result = await this.SanPhamRepo.search(
      page,
      sortType,
      filterType,
      limit,
      keyword,
      categoryIds
    );

    return result;
  }

  async searchAutocomplete(keyword: string): Promise<string[]> {
    return this.SanPhamRepo.searchAutocomplete(keyword);
  }

  // Tìm sản phẩm tương tự theo embedding vector
  async findByVector(queryText: string, limit: number) {
    const queryVector = await this.TransformService.getTextEmbedding(queryText);
    return this.SanPhamRepo.findByVector(queryVector, limit);
  }

  async findById(
    id: number,
    mode: 'default' | 'full' | 'search' = 'default',
    filterType?: ProductFilterType
  ): Promise<any> {
    const result: any = await this.SanPhamRepo.findById(id, mode, filterType);
    if (!result) {
      throw new NotFoundException('Tìm sản phẩm - Không tồn tại sản phẩm');
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];

    if (mode === 'full') {
      const SP_tuongTuRaw = await this.SanPhamRepo.findByVector(
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
    const existing = await this.SanPhamRepo.findById(id);
    if (!existing)
      throw new NotFoundException('Xóa sản phẩm - Sản phẩm không tồn tại');

    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };

    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];

    const deleted = await this.SanPhamRepo.update(id, {
      SP_trangThai: ProductStatus.Deleted,
      lichSuThaoTac: lichSuThaoTac,
    });
    if (!deleted) {
      throw new NotFoundException('Xóa sản phẩm - Xóa sản phẩm thất bại');
    }
    return deleted;
  }

  async countAll(): Promise<{
    live: { total: number; in: number; out: number };
    hidden: { total: number; in: number; out: number };
  }> {
    return this.SanPhamRepo.countAll();
  }
}
