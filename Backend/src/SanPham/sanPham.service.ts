import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SanPhamRepository,
  SanPhamFilterType,
  SanPhamSortType,
} from './sanPham.repository';
import { TransformService } from '../Util/transform.service';
import { SanPham, AnhSP } from './sanPham.schema';
import { CloudinaryService } from 'src/Util/cloudinary.service';
import { CreateDto, UpdateDto } from './sanPham.dto';
import { NhanVienService } from 'src/NguoiDung/NhanVien/nhanVien.service';
import { calculatePaginate } from 'src/Util/cursor-pagination';
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
    private readonly NhanVien: NhanVienService
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

    const allImages = [
      ...existing.SP_anh.filter((img) => !img.A_anhBia),
      ...newImages,
    ];

    if (newImages.find((i) => i.A_anhBia)) {
      // reset ảnh bìa nếu có ảnh bìa mới
      for (const img of allImages) img.A_anhBia = false;
      const cover = newImages.find((i) => i.A_anhBia);
      if (cover) cover.A_anhBia = true;
    }

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

    return { fieldsChange, updatePayload };
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
    mode?: 'head' | 'tail' | 'cursor';
    cursorId?: string;
    currentPage?: number;
    targetPage?: number;
    sortType?: SanPhamSortType;
    filterType?: SanPhamFilterType;
    limit?: number;
    keyword?: string;
    categoryId?: number;
  }): Promise<
    | {
        paginate: number[];
        currentPage: number;
        cursorId: string;
        data: any[];
        totalItems: number;
        totalPage: number;
        pages: number[];
      }
    | undefined
  > {
    const {
      mode = 'head',
      cursorId,
      currentPage = 1,
      targetPage = 1,
      sortType = 1,
      filterType = 12,
      limit = 24,
      keyword,
      categoryId,
    } = options;

    const totalItems = await this.SanPham.count(filterType);
    const totalPage = Math.ceil(totalItems / limit);

    let result: {
      data: any[];
      totalItems: number;
      totalPage: number;
      pages: number[];
    };
    let newCurrentPage = targetPage;

    switch (mode) {
      case 'head': {
        result = await this.SanPham.findAllHead(
          limit,
          sortType,
          filterType,
          keyword,
          categoryId
        );
        break;
      }

      case 'tail': {
        result = await this.SanPham.findAllTail(
          limit,
          sortType,
          filterType,
          keyword,
          categoryId
        );
        newCurrentPage = totalPage;
        break;
      }

      case 'cursor': {
        const skip = Math.abs(targetPage - currentPage) * limit;
        if (skip === 0) return;

        const direction = targetPage > currentPage ? 'forward' : 'back';
        if (direction === 'forward') {
          result = await this.SanPham.findAllForward(
            cursorId ?? '',
            skip,
            limit,
            sortType,
            filterType,
            keyword,
            categoryId
          );
        } else {
          result = await this.SanPham.findAllBack(
            cursorId ?? '',
            skip,
            limit,
            sortType,
            filterType
          );
        }
        break;
      }

      default:
        return;
    }

    const paginate = calculatePaginate(newCurrentPage, totalItems, limit);
    const newCursorId =
      result.data.length > 0 ? String(result.data[0].SP_id) : (cursorId ?? '');

    return {
      data: result.data,
      totalItems: result.totalItems,
      totalPage: result.totalPage,
      paginate,
      currentPage: newCurrentPage,
      cursorId: newCursorId,
      pages: result.pages,
    };
  }

  // Tìm sản phẩm tương tự theo embedding vector
  async findByVector(queryText: string, limit: number) {
    const queryVector = await this.Transform.getTextEmbedding(queryText);
    return this.SanPham.findByVector(queryVector, limit);
  }

  async findById(
    id: number,
    mode: 'default' | 'full' = 'default'
  ): Promise<{ product: any }> {
    const result: any = await this.SanPham.findById(id, mode);
    if (!result) {
      throw new NotFoundException();
    }
    console.log(result);
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    return { product: result };
  }

  async delete(id: number): Promise<SanPham> {
    const deleted = await this.SanPham.delete(id);
    if (!deleted) {
      throw new NotFoundException();
    }
    return deleted;
  }

  async countAll(): Promise<{ total: number; show: number; hidden: number }> {
    return this.SanPham.countAll();
  }
}
