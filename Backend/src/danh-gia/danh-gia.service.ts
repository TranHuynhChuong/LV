import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { DanhGiaRepository } from './repositories/danh-gia.repository';
import { UpdateDanhGiaDto } from './dto/update-danh-gia.dto';
import { SachUtilService } from 'src/sach/sach.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DanhGia } from './schemas/danh-gia.schema';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';

@Injectable()
export class DanhGiaService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly DanhGiaRepo: DanhGiaRepository,
    private readonly SachService: SachUtilService,
    private readonly NhanVienService: NhanVienUtilService
  ) {}

  /**
   * Tạo mới nhiều đánh giá sách, cập nhật điểm trung bình từng sách trong cùng transaction
   *
   * @param dtos Mảng dữ liệu đánh giá cần tạo
   * @returns Mảng các đánh giá đã được tạo
   * @throws BadRequestException nếu không thể tạo hoặc không có đánh giá nào được tạo
   */
  async create(dtos: CreateDanhGiaDto[]): Promise<DanhGia[]> {
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(
        async (): Promise<DanhGia[]> => {
          const createdDanhGias: DanhGia[] = [];
          for (const dto of dtos) {
            const created = await this.DanhGiaRepo.create(dto, session);
            if (!created) {
              throw new BadRequestException('Tạo đánh giá - Tạo thất bại');
            }
            await this.SachService.updateRating(
              dto.S_id,
              created.DG_diem,
              session
            );

            createdDanhGias.push(created);
          }
          return createdDanhGias;
        }
      );
      if (!result || result.length === 0) {
        throw new BadRequestException(
          'Tạo đánh giá - Không có đánh giá nào được tạo'
        );
      }
      return result;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy tất cả đánh giá của một quyển sách (phân trang)
   *
   * @param bookId ID sách cần lấy đánh giá
   * @param page Trang hiện tại
   * @param limit Số lượng đánh giá mỗi trang (mặc định 24)
   * @returns Danh sách đánh giá tương ứng
   */
  async findAllOfBook(bookId: number, page: number, limit = 24) {
    return this.DanhGiaRepo.findAllOfBook(bookId, page, limit);
  }

  /**
   * Lọc tất cả đánh giá theo nhiều tiêu chí
   *
   * @param option Các tùy chọn lọc như trang, điểm, ngày, trạng thái
   * @returns Danh sách đánh giá và tổng số
   */
  async findAll(option: {
    page: number;
    limit: number;
    rating?: number;
    from?: Date;
    to?: Date;
    status?: 'all' | 'visible' | 'hidden';
  }): Promise<any> {
    const { page, limit = 24, rating, from, to, status } = option;
    const result: any = await this.DanhGiaRepo.findAll(
      page,
      limit,
      rating,
      from,
      to,
      status
    );
    for (const item of result.data) {
      const lichSu = item.lichSuThaoTac ?? [];
      item.lichSuThaoTac =
        lichSu.length > 0
          ? await this.NhanVienService.mapActivityLog(lichSu)
          : [];
    }
    return result;
  }

  /**
   * Hiển thị (bỏ ẩn) một đánh giá và cập nhật điểm sách
   *
   * @param dto Dữ liệu cập nhật bao gồm ID đơn hàng, sách, khách hàng và nhân viên
   * @returns Đánh giá đã được cập nhật
   * @throws NotFoundException nếu không tìm thấy đánh giá
   * @throws BadRequestException nếu cập nhật thất bại
   */
  async show(dto: UpdateDanhGiaDto): Promise<DanhGia> {
    const session = await this.connection.startSession();
    let updated: DanhGia | null = null;
    try {
      await session.withTransaction(async () => {
        const current = await this.DanhGiaRepo.findOne(
          dto.DH_id,
          dto.S_id,
          dto.KH_id
        );
        if (!current) {
          throw new NotFoundException(
            'Cập nhật đánh giá - Không tìm thấy đánh giá'
          );
        }
        const thaoTac = {
          thaoTac: 'Hiển thị đánh giá',
          NV_id: dto.NV_id,
          thoiGian: new Date(),
        };
        const updateResult = await this.DanhGiaRepo.update(
          dto.DH_id,
          dto.S_id,
          dto.KH_id,
          false,
          thaoTac,
          session
        );
        if (!updateResult) {
          throw new BadRequestException(
            'Cập nhật đánh giá - Hiển thị thất bại'
          );
        }
        updated = updateResult;

        await this.SachService.updateRating(dto.S_id, updated.DG_diem, session);
      });
      if (!updated) {
        throw new BadRequestException('Cập nhật đánh giá - Không thể cập nhật');
      }
      return updated;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Ẩn một đánh giá và cập nhật lại điểm sách
   *
   * @param dto Dữ liệu cập nhật bao gồm ID đơn hàng, sách, khách hàng và nhân viên
   * @returns Đánh giá đã được cập nhật
   * @throws NotFoundException nếu không tìm thấy đánh giá
   * @throws BadRequestException nếu cập nhật thất bại
   */
  async hide(dto: UpdateDanhGiaDto): Promise<DanhGia> {
    const session = await this.connection.startSession();
    let updated: DanhGia | null = null;
    try {
      await session.withTransaction(async () => {
        const current = await this.DanhGiaRepo.findOne(
          dto.DH_id,
          dto.S_id,
          dto.KH_id,
          session
        );
        if (!current) {
          throw new NotFoundException(
            'Cập nhật đánh giá - Không tìm thấy đánh giá'
          );
        }
        const thaoTac = {
          thaoTac: 'Ẩn đánh giá',
          NV_id: dto.NV_id,
          thoiGian: new Date(),
        };
        const updateResult = await this.DanhGiaRepo.update(
          dto.DH_id,
          dto.S_id,
          dto.KH_id,
          true,
          thaoTac,
          session
        );
        if (!updateResult) {
          throw new BadRequestException('Cập nhật đánh giá - Ẩn thất bại');
        }
        updated = updateResult;

        await this.SachService.updateRating(
          dto.S_id,
          -updated.DG_diem,
          session
        );
      });
      if (!updated) {
        throw new BadRequestException('Cập nhật đánh giá - Không thể cập nhật');
      }
      return updated;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy thống kê số lượng đánh giá trong khoảng thời gian chỉ định.
   *
   * @param from - Ngày bắt đầu (tính từ 00:00:00).
   * @param to - Ngày kết thúc (tính đến 23:59:59).
   * @returns Thống kê đánh giá trong khoảng thời gian.
   */
  async getRatingStats(from: Date, to: Date) {
    return this.DanhGiaRepo.getRatingStats(from, to);
  }
}
