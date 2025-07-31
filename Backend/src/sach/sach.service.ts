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
import { getNextSequence } from 'src/Util/counter.service';

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

  /**
   * Tìm các sách theo danh sách ID đã cho và chỉ lấy sách đang hiển thị.
   *
   * @param ids Mảng ID sách cần tìm
   * @returns Promise<any[]> Danh sách sách tìm được
   */
  async findByIds(ids: number[]): Promise<any[]> {
    const result = await this.SachRepo.findAllShowByIds(ids);
    return result;
  }

  /**
   * Tìm các sách thuộc các thể loại được chỉ định.
   *
   * @param ids Mảng ID thể loại
   * @returns Promise<Sach[]> Danh sách sách thuộc các thể loại
   */
  async findInCategories(ids: number[]) {
    return this.SachRepo.findInCategories(ids);
  }

  /**
   * Cập nhật số lượng đã bán và tồn kho của các sách theo danh sách cập nhật.
   *
   * @param updates Mảng đối tượng chứa id sách và số lượng đã bán mới
   * @param session Phiên làm việc của MongoDB để hỗ trợ transaction
   * @throws NotFoundException nếu có sách không tồn tại trong cập nhật
   * @returns Promise<any> Kết quả thao tác bulkWrite
   */
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

  /**
   * Cập nhật điểm đánh giá cho sách theo ID.
   *
   * @param id ID sách cần cập nhật điểm
   * @param score Điểm đánh giá mới
   * @param session Phiên làm việc MongoDB hỗ trợ transaction
   * @returns Promise<any> Kết quả cập nhật
   */
  async updateRating(id: number, score: number, session: ClientSession) {
    return this.SachRepo.updateRating(id, score, session);
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

  /**
   * Tạo mới một bản ghi sách trong cơ sở dữ liệu.
   *
   * @param data Dữ liệu sách cần tạo (CreateSachDto)
   * @param coverImage (Tuỳ chọn) Ảnh bìa sách upload từ client
   * @param images (Tuỳ chọn) Danh sách ảnh khác upload từ client
   * @returns Promise<Sach> Bản ghi sách vừa được tạo
   */
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
        if (!this.connection.db) {
          throw new Error('Không thể kết nối cơ sở dữ liệu');
        }
        // Lấy giá trị seq tự tăng từ MongoDB
        nextId = await getNextSequence(this.connection.db, 'bookId', session);
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

  /**
   * Cập nhật thông tin sách theo ID.
   *
   * @param id ID của sách cần cập nhật
   * @param data Dữ liệu cập nhật sách (UpdateSachDto)
   * @param coverImage (Tuỳ chọn) Ảnh bìa mới upload từ client
   * @param images (Tuỳ chọn) Danh sách ảnh mới upload từ client
   * @returns Promise<Sach> Bản ghi sách đã được cập nhật
   */
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
    } catch {
      await session.abortTransaction();
      await this.rollbackUploadedImages(newImages);
      throw new BadRequestException(
        'Cập nhật sản phẩm - Cập nhật sản phẩm thất bại'
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Xử lý upload và lưu trữ ảnh bìa và ảnh minh họa cho sách.
   *
   * @param id ID của sách liên quan đến ảnh
   * @param coverImage (Tuỳ chọn) Ảnh bìa sách được upload mới
   * @param images (Tuỳ chọn) Danh sách ảnh minh họa được upload mới
   * @returns Promise<Anh[]> Danh sách ảnh đã xử lý và lưu trữ cho sách
   */
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

  /**
   * Phát hiện các trường dữ liệu đã thay đổi so với bản ghi hiện tại.
   *
   * @param data Dữ liệu cập nhật mới (UpdateSachDto)
   * @param existing Bản ghi sách hiện tại (Sach)
   * @returns Object chứa:
   *   - fieldsChange: Danh sách tên các trường đã thay đổi (dạng chuỗi mô tả)
   *   - updatePayload: Dữ liệu cập nhật thực tế chỉ gồm các trường đã thay đổi
   */
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

  /**
   * So sánh hai mảng có bằng nhau hay không (so sánh từng phần tử và thứ tự).
   *
   * @param arr1 Mảng thứ nhất
   * @param arr2 Mảng thứ hai
   * @returns true nếu hai mảng có cùng độ dài và từng phần tử tương ứng bằng nhau, ngược lại false
   */
  private areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  /**
   * Thực hiện rollback (xóa) các ảnh đã tải lên khi xảy ra lỗi hoặc cần hoàn tác.
   *
   * @param images Mảng các đối tượng ảnh đã upload cần được xóa để rollback
   */
  private async rollbackUploadedImages(images: Anh[]) {
    for (const img of images) {
      try {
        await this.CloudinaryService.deleteImage(img.A_publicId);
      } catch {
        console.warn(`Không thể xóa ảnh đã upload: ${img.A_publicId}`);
      }
    }
  }

  /**
   * Tìm và lấy danh sách tất cả sách theo các tùy chọn phân trang, sắp xếp và lọc.
   *
   * @param options Các tuỳ chọn để lấy sách gồm:
   *  - page: số trang (mặc định trang 1)
   *  - sortType: kiểu sắp xếp theo enum BookSortType
   *  - filterType: kiểu lọc theo enum BookFilterType
   *  - limit: số lượng bản ghi trên mỗi trang (mặc định 24)
   * @returns Kết quả danh sách sách với dữ liệu phân trang
   */
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

  /**
   * Tìm kiếm sách theo từ khóa, thể loại, kèm các tùy chọn phân trang, sắp xếp và lọc.
   *
   * @param options Các tùy chọn tìm kiếm gồm:
   *  - page: số trang (mặc định trang 1)
   *  - sortType: kiểu sắp xếp theo enum BookSortType
   *  - filterType: kiểu lọc theo enum BookFilterType
   *  - limit: số lượng bản ghi trên mỗi trang (mặc định 24)
   *  - keyword: từ khóa tìm kiếm (theo tên, tác giả, nhà xuất bản)
   *  - categoryId: ID thể loại để lọc sách theo thể loại
   * @returns Kết quả tìm kiếm sách theo phân trang
   */
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

  /**
   * Tìm kiếm tự động (autocomplete) theo từ khóa trên các trường: tên sách, tác giả, nhà xuất bản.
   *
   * @param keyword Từ khóa dùng để tìm kiếm autocomplete
   * @param limit Số lượng kết quả tối đa trả về (mặc định 10)
   * @returns Mảng các chuỗi gợi ý phù hợp với từ khóa
   */
  async searchAutocomplete(keyword: string, limit?: number): Promise<string[]> {
    return this.SachRepo.searchAutocomplete(keyword, limit);
  }

  /**
   * Tìm sách dựa trên vector đặc trưng (embedding vector) với khả năng tìm kiếm gần đúng.
   *
   * @param queryVector Vector truy vấn dùng để so sánh
   * @param limit Số lượng kết quả trả về tối đa (mặc định 5)
   * @param minScore Ngưỡng điểm tối thiểu để lọc kết quả (mặc định 0)
   * @returns Mảng sách được sắp xếp theo điểm tương đồng giảm dần
   */
  async findByVector(queryVector: number[], limit?: number, minScore?: number) {
    return this.SachRepo.findByVector(queryVector, limit, minScore);
  }

  /**
   * Tìm sách theo mã ISBN với tùy chọn bộ lọc trạng thái sách.
   *
   * @param id Mã ISBN của sách cần tìm
   * @param filterType Loại bộ lọc trạng thái sách (mặc định không lọc)
   * @returns Thông tin sách đầu tiên tìm thấy hoặc null nếu không tìm thấy
   */
  async findByIsbn(id: string, filterType?: BookFilterType): Promise<any> {
    return this.SachRepo.findByIsbn(id, filterType);
  }

  /**
   * Tìm sách theo ID với hai chế độ trả về:
   * - 'default': chỉ trả về dữ liệu cơ bản, loại bỏ sách đã xóa
   * - 'full': trả về dữ liệu đầy đủ kèm thông tin thể loại và khuyến mãi
   *
   * @param id ID của sách cần tìm
   * @param mode Chế độ trả về dữ liệu ('default' hoặc 'full'), mặc định là 'default'
   * @returns Thông tin sách hoặc null nếu không tìm thấy
   */
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

  /**
   * Xóa sách theo ID, đồng thời ghi lại lịch sử thao tác của nhân viên
   *
   * @param id - ID của sách cần xóa
   * @param NV_id - ID nhân viên thực hiện thao tác xóa
   * @returns Trả về bản ghi sách đã được cập nhật trạng thái xóa
   */
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

  /**
   * Đếm tổng số sách theo trạng thái hiển thị và tồn kho
   *
   * @returns Một đối tượng chứa số liệu thống kê sách:
   * - live: sách đang hiển thị, gồm tổng số, số sách còn hàng và hết hàng
   * - hidden: sách bị ẩn, gồm tổng số, số sách còn hàng và hết hàng
   */
  async countAll(): Promise<{
    live: { total: number; in: number; out: number };
    hidden: { total: number; in: number; out: number };
  }> {
    return this.SachRepo.countAll();
  }
}
