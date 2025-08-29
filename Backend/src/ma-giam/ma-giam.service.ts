import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  MaGiamRepository,
  VoucherFilterType,
  VoucherType,
} from './repositories/ma-giam.repository';
import { MaGiam } from './schemas/ma-giam.schema';
import { CreateMaGiamDto } from './dto/create-ma-giam.dto';
import { UpdateMaGiamDto } from './dto/update-ma-giam.dto';
import { MaGiamDonHangRepository } from './repositories/ma-giam-don-hang.repository';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { LichSuThaoTacService } from 'src/lich-su-thao-tac/lich-su-thao-tac.service';
import { DULIEU } from 'src/lich-su-thao-tac/schemas/lich-su-thao-tac.schema';
import { plainToInstance } from 'class-transformer';
import { MaGiamResponseDto } from './dto/response-ma-giam.dto';

@Injectable()
export class MaGiamUtilService {
  constructor(
    private readonly MaGiamRepo: MaGiamRepository,
    private readonly MaGiamDonHangRepo: MaGiamDonHangRepository
  ) {}

  /**
   * Kiểm tra tính hợp lệ của các mã giảm theo danh sách ID.
   *
   * @param ids - Danh sách ID mã giảm cần kiểm tra.
   * @returns Danh sách mã giảm hợp lệ.
   */
  async findValidByIds(ids: string[]) {
    return this.MaGiamRepo.checkValid(ids);
  }

  /**
   * Tạo liên kết mã giảm cho một đơn hàng (mã giảm sử dụng cho đơn hàng).
   *
   * @param orderId - ID của đơn hàng.
   * @param voucherIds - Danh sách ID mã giảm.
   * @param session - Phiên MongoDB để hỗ trợ transaction.
   */
  async createVoucherForOrder(
    dhId: string,
    mgIds: string[],
    session?: ClientSession
  ) {
    return this.MaGiamDonHangRepo.create(dhId, mgIds, session);
  }

  /**
   * Lấy thống kê số lượng mã giảm được áp dụng theo đơn hàng.
   *
   * @param orderIds - Danh sách ID đơn hàng.
   */
  async getVoucherStatsForOrders(dhIds: string[]) {
    return this.MaGiamDonHangRepo.getVoucherStats(dhIds);
  }
}

@Injectable()
export class MaGiamService {
  constructor(
    private readonly MaGiamRepo: MaGiamRepository,
    @InjectConnection() private readonly connection: Connection,
    private readonly LichSuThaoTacService: LichSuThaoTacService
  ) {}

  /**
   * Tạo mới một mã giảm giá.
   *
   * @param data - Dữ liệu mã giảm cần tạo.
   * @throws ConflictException nếu mã đã tồn tại.
   */
  async create(newData: CreateMaGiamDto) {
    const existing = await this.MaGiamRepo.findExisting(newData.MG_id);
    if (existing) {
      throw new ConflictException();
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const created = await this.MaGiamRepo.create(newData, session);
      if (!created) {
        throw new BadRequestException('Tạo mã giảm - Tạo mã giảm thất bại');
      }
      await this.LichSuThaoTacService.create({
        actionType: 'create',
        staffId: newData.NV_id ?? '',
        dataName: DULIEU.VOUCHER,
        dataId: newData.MG_id,
        session: session,
      });
      await session.commitTransaction();
      return created;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(`Tạo mã giảm - ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy danh sách mã giảm có phân trang và bộ lọc.
   *
   * @param params - Thông tin phân trang và bộ lọc.
   */
  async getAll(params: {
    page: number;
    limit: number;
    filterType?: VoucherFilterType;
    type?: VoucherType;
  }) {
    const { data, paginationInfo } = await this.MaGiamRepo.findAll(params);
    return {
      data: plainToInstance(MaGiamResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      paginationInfo,
    };
  }

  /**
   * Lấy tất cả mã giảm còn hiệu lực.
   */
  async getAllValid() {
    const result = await this.MaGiamRepo.findAllValid();
    return plainToInstance(MaGiamResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lấy thông tin chi tiết một mã giảm theo ID.
   *
   * @param id - ID mã giảm.
   * @param filterType - Kiểu lọc mã.
   * @param type - Loại mã giảm.
   * @return Mã giảm.
   */
  async getById(
    id: string,
    filterType?: VoucherFilterType,
    type?: VoucherType
  ) {
    const result = await this.MaGiamRepo.findById(id, filterType, type);
    if (!result) {
      throw new NotFoundException('Tìm mã giảm - Mã giảm không tồn tại');
    }
    return plainToInstance(MaGiamResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Cập nhật một mã giảm theo ID.
   *
   * @param id - ID mã giảm.
   * @param newData - Dữ liệu cập nhật.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu thay đổi không hợp lệ.
   */
  async update(id: string, newData: UpdateMaGiamDto): Promise<MaGiam> {
    // Tìm bản ghi hiện tại theo id
    const existing = await this.MaGiamRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Cập nhật mã giảm - Không tim thấy mã giảm');
    }
    const now = new Date();
    const isOngoing = existing.MG_batDau <= now && now <= existing.MG_ketThuc;
    if (
      isOngoing &&
      newData.MG_batDau &&
      newData.MG_batDau.getTime() !== existing.MG_batDau.getTime()
    ) {
      throw new BadRequestException(
        'Cập nhật mã giảm - Không thể cập nhật thời gian bắt đầu khi mã giảm đang diễn ra.'
      );
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { updatePayload } = await this.LichSuThaoTacService.create({
        actionType: 'update',
        staffId: newData.NV_id ?? '',
        dataName: DULIEU.VOUCHER,
        dataId: id,
        newData: newData,
        existingData: existing,
        ignoreFields: ['NV_id'],
        session: session,
      });

      const updated = await this.MaGiamRepo.update(id, updatePayload, session);
      if (!updated) {
        throw new BadRequestException(
          'Cập nhật mã giảm - Cập nhật mã giảm thất bại'
        );
      }

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(
        `Cập nhật phí vận chuyển - ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Xóa một mã giảm giá theo ID.
   *
   * @param id - ID mã giảm.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu mã đang có hiệu lực.
   */
  async delete(id: string) {
    // Tìm bản ghi hiện tại theo id
    const current = await this.MaGiamRepo.findById(id);
    if (!current) {
      throw new NotFoundException('Xóa mã giảm - Không tim thấy mã giảm');
    }
    const now = new Date();
    const isOngoing = current.MG_batDau <= now && now <= current.MG_ketThuc;
    if (isOngoing) {
      throw new BadRequestException(
        'Xóa mã giảm - Không thể xóa khi mã giảm đang diễn ra.'
      );
    }
    return this.MaGiamRepo.delete(id);
  }

  /**
   * Đếm số lượng mã giảm đang có hiệu lực.
   *
   * @returns Số lượng mã giảm hợp lệ.
   */
  async countValid(): Promise<number> {
    return this.MaGiamRepo.countValid();
  }
}
