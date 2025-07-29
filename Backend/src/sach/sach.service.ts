import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookFilterType,
  BookSortType,
  SachRepository,
} from './repositories/sach.repository';
import { TransformService } from '../Util/transform.service';
import { Sach, Anh, BookStatus } from './schemas/sach.schema';
import { CloudinaryService } from 'src/Util/cloudinary.service';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';
import { TheLoaiUtilService } from 'src/the-loai/the-loai.service';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';
import { KhuyenMaiUtilService } from 'src/khuyen-mai/khuyen-mai.service';

const folderPrefix = 'Books';

const typeOfChange: Record<string, string> = {
  TL_id: 'Thể loại',
  S_trangThai: 'Trạng thái',
  S_ten: 'Tên',
  S_tomTat: 'Nội dung tóm tắt',
  S_moTa: 'Mô tả',
  S_tacGia: 'Tác giả',
  S_nhaXuaBan: 'Nhà xuất bản',
  S_ngonNgu: 'Ngôn ngữ',
  S_nguoiDich: 'Người dịch',
  S_namXuatBan: 'Năm xuất bản',
  S_soTrang: 'Số trang',
  S_isbn: 'ISBN',
  S_giaBan: 'Giá bán',
  S_giaNhap: 'Giá nhập',
  S_tonKho: 'Tồn kho',
  S_trongLuong: 'Trọng lượng',
  S_kichThuoc: 'Kích thước',
  S_anh: 'Hình ảnh',
};

@Injectable()
export class SachUtilService {
  constructor(private readonly SachRepo: SachRepository) {}

  async findByIds(ids: number[]): Promise<any[]> {
    const result = await this.SachRepo.findAllShowByIds(ids);
    return result;
  }

  async findInCategories(ids: number[]) {
    return this.SachRepo.findInCategories(ids);
  }

  async updateSold(
    updates: { id: number; sold: number }[],
    session: ClientSession
  ) {
    const result = await this.SachRepo.updateSold(updates, session);

    if (result.modifiedCount < updates.length) {
      throw new NotFoundException(
        'Cập nhật bán hàng - Có sản phẩm không tồn tại'
      );
    }

    return result;
  }

  async updateScore(id: number, score: number, session: ClientSession) {
    return this.SachRepo.updateScore(id, score, session);
  }
}

@Injectable()
export class SachService {
  constructor(
    private readonly SachRepo: SachRepository,
    private readonly TransformService: TransformService,
    private readonly CloudinaryService: CloudinaryService,
    private readonly NhanVienService: NhanVienUtilService,
    private readonly KhuyenMaiService: KhuyenMaiUtilService,

    @Inject(forwardRef(() => TheLoaiUtilService))
    private readonly TheLoai: TheLoaiUtilService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async create(
    data: CreateSachDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<Sach> {
    const session = await this.connection.startSession();
    let nextId: number = 0;
    try {
      let finalResult: Sach;
      await session.withTransaction(async () => {
        const vector = await this.TransformService.getTextEmbedding(
          data.S_tomTat,
          'passage'
        );
        const lastId = await this.SachRepo.findLastId(session);
        nextId = lastId + 1;

        const thaoTac = {
          thaoTac: 'Tạo mới',
          NV_id: data.NV_id,
          thoiGian: new Date(),
        };

        const dataToSave: Partial<Sach> = {
          ...data,
          S_id: nextId,
          S_eTomTat: vector,
          S_anh: [],
          lichSuThaoTac: [thaoTac],
        };

        const created = await this.SachRepo.create(dataToSave, session);
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

        const updated = await this.SachRepo.update(
          nextId,
          { S_anh: uploadedImages },
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
    data: UpdateSachDto,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<Sach> {
    const existing = await this.SachRepo.findById(id);
    if (!existing)
      throw new NotFoundException('Cập nhật sản phẩm - Không tồn tại sản phẩm');

    const session = await this.connection.startSession();
    session.startTransaction();

    // const vector =
    //   data.S_tomTat && data.S_tomTat !== existing.S_tomTat
    //     ? await this.TransformService.getTextEmbedding(data.S_tomTat, 'passage')
    //     : existing.S_eTomTat;

    // let newImages: Anh[] = [];

    // if (images || coverImage) {
    //   try {
    //     newImages = await this.handleImageUploads(id, coverImage, images);
    //   } catch {
    //     throw new BadRequestException(
    //       'Cập nhật sản phẩm - Không thể cập nhật ảnh'
    //     );
    //   }
    // }

    // const imagesToDelete = data.imagesToDelete ?? [];
    // const remainingImages = existing.S_anh.filter(
    //   (img) => !imagesToDelete.includes(img.A_url)
    // );

    // const allImages = [...remainingImages, ...newImages];

    // const { fieldsChange, updatePayload } = this.detectChangedFields(
    //   data,
    //   existing
    // );
    // if (vector !== existing.S_eTomTat) updatePayload.S_eTomTat = vector;
    // if (newImages.length) {
    //   updatePayload.S_anh = allImages;
    //   fieldsChange.push('Cập nhật hình ảnh');
    // }

    // if (fieldsChange.length > 0 && data.NV_id) {
    //   updatePayload.lichSuThaoTac = [
    //     ...existing.lichSuThaoTac,
    //     {
    //       thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
    //       NV_id: data.NV_id,
    //       thoiGian: new Date(),
    //     },
    //   ];
    // }

    // if (Object.keys(updatePayload).length === 0) return existing as Sach;

    // try {
    //   const updated = await this.SachRepo.update(id, updatePayload);
    //   if (!updated) throw new Error();
    //   return updated;
    // } catch {
    //   await this.rollbackUploadedImages(newImages);
    //   throw new BadRequestException(
    //     'Cập nhật sản phẩm - Cập nhật sản phẩm thất bại'
    //   );
    // }
    let newImages: Anh[] = [];
    try {
      const vector =
        data.S_tomTat && data.S_tomTat !== existing.S_tomTat
          ? await this.TransformService.getTextEmbedding(
              data.S_tomTat,
              'passage'
            )
          : existing.S_eTomTat;

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
      const remainingImages = existing.S_anh.filter(
        (img) => !imagesToDelete.includes(img.A_url)
      );

      const allImages = [...remainingImages, ...newImages];

      const { fieldsChange, updatePayload } = this.detectChangedFields(
        data,
        existing
      );
      if (vector !== existing.S_eTomTat) updatePayload.S_eTomTat = vector;
      if (newImages.length) {
        updatePayload.S_anh = allImages;
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
      const giaBanChanged =
        data.S_giaBan !== undefined && data.S_giaBan !== existing.S_giaBan;
      if (giaBanChanged && data.S_giaBan) {
        await this.KhuyenMaiService.updatePromotionOfBook(
          id,
          data.S_giaBan,
          session
        );
      }
      if (Object.keys(updatePayload).length === 0) return existing as Sach;
      const updated = await this.SachRepo.update(id, updatePayload, session);
      if (!updated) throw new Error();
      await session.commitTransaction();
      return updated;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      await this.rollbackUploadedImages(newImages);
      throw new BadRequestException(
        'Cập nhật sản phẩm - Cập nhật sản phẩm thất bại'
      );
    } finally {
      await session.endSession();
    }
  }

  private async handleImageUploads(
    id: number,
    coverImage?: Express.Multer.File,
    images?: Express.Multer.File[]
  ): Promise<Anh[]> {
    const uploaded: Anh[] = [];

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
    data: UpdateSachDto,
    existing: Sach
  ): { fieldsChange: string[]; updatePayload: Partial<Sach> } {
    const fieldsChange: string[] = [];
    const updatePayload: Partial<Sach> = {};

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

  private async rollbackUploadedImages(images: Anh[]) {
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
    sortType?: BookSortType;
    filterType?: BookFilterType;
    limit?: number;
  }) {
    const {
      page = 1,
      sortType = BookSortType.Latest,
      filterType,
      limit = 24,
    } = options;

    const result = await this.SachRepo.findAll(
      page,
      sortType,
      filterType,
      limit
    );

    return result;
  }

  async search(options: {
    page?: number;
    sortType?: BookSortType;
    filterType?: BookFilterType;
    limit?: number;
    keyword?: string;
    categoryId?: number;
  }) {
    const {
      page = 1,
      sortType = BookSortType.Latest,
      filterType,
      limit = 24,
      keyword,
      categoryId,
    } = options;

    const categoryIds = categoryId
      ? [categoryId, ...(await this.TheLoai.findAllChildren(categoryId))]
      : undefined;

    const result = await this.SachRepo.search(
      page,
      sortType,
      filterType,
      limit,
      keyword,
      categoryIds
    );

    return result;
  }

  async searchAutocomplete(keyword: string, limit?: number): Promise<string[]> {
    return this.SachRepo.searchAutocomplete(keyword, limit);
  }

  // Tìm sản phẩm tương tự theo embedding vector
  async findByVector(queryText: string, limit: number) {
    const queryVector = await this.TransformService.getTextEmbedding(
      queryText,
      'query'
    );
    return this.SachRepo.findByVector(queryVector, limit);
  }

  async findByIsbn(id: string, filterType?: BookFilterType): Promise<any> {
    return this.SachRepo.findByIsbn(id, filterType);
  }

  async findById(
    id: number,
    mode: 'default' | 'full' = 'default'
  ): Promise<any> {
    const result: any = await this.SachRepo.findById(id, mode);
    if (!result) {
      throw new NotFoundException('Tìm sản phẩm - Không tồn tại sản phẩm');
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];

    if (mode === 'full') {
      const S_tuongTuRaw = await this.SachRepo.findByVector(
        result.S_eTomTat,
        11
      );

      // Lọc bỏ sản phẩm trùng id
      const S_tuongTu = S_tuongTuRaw.filter((sp) => sp.S_id !== id);

      delete result.S_eTomTat;

      return { ...result, S_tuongTu };
    } else return result;
  }

  async delete(id: number, NV_id: string): Promise<Sach> {
    const existing = await this.SachRepo.findById(id);
    if (!existing)
      throw new NotFoundException('Xóa sản phẩm - Sản phẩm không tồn tại');

    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };

    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];

    const deleted = await this.SachRepo.update(id, {
      S_trangThai: BookStatus.Deleted,
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
    return this.SachRepo.countAll();
  }
}
