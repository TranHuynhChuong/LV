import {
  BadRequestException,
  ConflictException,
  Injectable,
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
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';
import { MaGiamDonHangRepository } from './repositories/ma-giam-don-hang.repository';
import { ClientSession } from 'mongoose';

const typeOfChange: Record<string, string> = {
  MG_batDau: 'Thời gian bắt đầu',
  MG_ketThuc: 'Thời gian kết thúc',
  MG_theoTyLe: 'Kiểu giảm giá',
  MG_giaTri: 'Giá trị giảm',
  MG_loai: 'Loại mã giảm',
  MG_toiThieu: 'Giá trị tối thiểu',
  MG_toiDa: 'Giá trị tối đa',
};

@Injectable()
export class MaGiamUtilService {
  constructor(
    private readonly MaGiamRepo: MaGiamRepository,
    private readonly MaGiamDonHangRepo: MaGiamDonHangRepository
  ) {}

  /**
   * Kiểm tra tính hợp lệ của các mã giảm theo danh sách ID.
   * @param ids - Danh sách ID mã giảm cần kiểm tra.
   * @returns Danh sách mã giảm hợp lệ.
   */
  async findValidByIds(ids: string[]) {
    return this.MaGiamRepo.checkValid(ids);
  }

  /**
   * Tạo liên kết mã giảm cho một đơn hàng (mã giảm sử dụng cho đơn hàng).
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
    private readonly NhanVienService: NhanVienUtilService
  ) {}

  /**
   * Tạo mới một mã giảm giá.
   * @param data - Dữ liệu mã giảm cần tạo.
   * @throws ConflictException nếu mã đã tồn tại.
   */
  async create(data: CreateMaGiamDto) {
    const existing = await this.MaGiamRepo.findExisting(data.MG_id);
    if (existing) {
      throw new ConflictException();
    }

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: data.NV_id,
      thoiGian: new Date(),
    };

    const created = await this.MaGiamRepo.create({
      ...data,
      lichSuThaoTac: [thaoTac],
    });

    if (!created) {
      throw new BadRequestException('Tạo mã giảm - Tạo mã giảm thất bại');
    }

    return created;
  }

  /**
   * Lấy danh sách mã giảm có phân trang và bộ lọc.
   * @param params - Thông tin phân trang và bộ lọc.
   */
  async getAll(params: {
    page: number;
    limit: number;
    filterType?: VoucherFilterType;
    type?: VoucherType;
  }) {
    return this.MaGiamRepo.findAll(params);
  }

  /**
   * Lấy tất cả mã giảm còn hiệu lực.
   */
  async getAllValid() {
    return this.MaGiamRepo.findAllValid();
  }

  /**
   * Lấy thông tin chi tiết một mã giảm theo ID.
   * @param id - ID mã giảm.
   * @param filterType - Kiểu lọc mã.
   * @param type - Loại mã giảm.
   * @throws NotFoundException nếu không tìm thấy mã giảm.
   */
  async getById(
    id: string,
    filterType?: VoucherFilterType,
    type?: VoucherType
  ): Promise<any> {
    const result: any = await this.MaGiamRepo.findById(id, filterType, type);
    if (!result) {
      throw new NotFoundException('Tìm mã giảm - Mã giảm không tồn tại');
    }
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];

    return result;
  }

  /**
   * Cập nhật một mã giảm theo ID.
   * @param id - ID mã giảm.
   * @param newData - Dữ liệu cập nhật.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu thay đổi không hợp lệ.
   */
  async update(id: string, newData: UpdateMaGiamDto): Promise<MaGiam> {
    // Tìm bản ghi hiện tại theo id
    const current = await this.MaGiamRepo.findById(id);
    if (!current) {
      throw new NotFoundException('Cập nhật mã giảm - Không tim thấy mã giảm');
    }
    const now = new Date();
    const isOngoing = current.MG_batDau <= now && now <= current.MG_ketThuc;
    if (
      isOngoing &&
      newData.MG_batDau &&
      newData.MG_batDau.getTime() !== current.MG_batDau.getTime()
    ) {
      throw new BadRequestException(
        'Cập nhật mã giảm - Không thể cập nhật thời gian bắt đầu khi mã giảm đang diễn ra.'
      );
    }
    // Xác định trường thay đổi
    const fieldsChange: string[] = [];
    const updatePayload: any = {};
    for (const key of Object.keys(newData)) {
      if (key === 'NV_id') continue;
      const newValue = newData[key];
      const currentValue = current[key];
      const isChanged =
        currentValue instanceof Date && newValue instanceof Date
          ? currentValue.getTime() !== newValue.getTime()
          : newValue !== undefined && newValue !== currentValue;
      if (isChanged) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newValue;
      }
    }
    // Thêm lịch sử thao tác nếu có thay đổi
    if (fieldsChange.length > 0 && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };
      updatePayload.lichSuThaoTac = [...current.lichSuThaoTac, thaoTac];
    }
    // Không có thay đổi thì trả về bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return current;
    }
    const updated = await this.MaGiamRepo.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException(
        'Cập nhật mã giảm - Cập nhật mã giảm thất bại'
      );
    }
    return updated;
  }

  /**
   * Xóa một mã giảm giá theo ID.
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
   * @returns Số lượng mã giảm hợp lệ.
   */
  async countValid(): Promise<number> {
    return this.MaGiamRepo.countValid();
  }
}
