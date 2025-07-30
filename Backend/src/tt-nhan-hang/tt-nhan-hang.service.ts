import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { TTNhanHangDHRepository } from './repositories/tt-nhan-hang-dh.repository';
import { TTNhanHangKHRepository } from './repositories/tt-nhan-hang-kh.repository';
import { TTNhanHangKH } from './schemas/tt-nhan-hang-kh.schema';
import { TTNhanHangDH } from './schemas/tt-nhan-hang-dh.schema';
import { DiaChiService } from 'src/dia-chi/dia-chi.service';
@Injectable()
export class TTNhanHangDHService {
  constructor(
    private readonly TTNhanHangDHRepo: TTNhanHangDHRepository,
    private readonly DiaChiService: DiaChiService
  ) {}

  /**
   * Tạo mới thông tin nhận hàng cho đơn hàng.
   *
   * @param data - Dữ liệu thông tin nhận hàng của đơn hàng (có thể thiếu một số trường).
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB dùng để thực hiện trong transaction.
   * @returns Thông tin vừa được tạo sau khi lưu vào cơ sở dữ liệu.
   */
  async create(data: Partial<TTNhanHangDH>, session?: ClientSession) {
    const result = await this.TTNhanHangDHRepo.createDH(data, session);
    if (!result) {
      throw new BadRequestException(
        'Tạo thông tin nhận hàng đơn hàng - Tạo thất bại'
      );
    }
    return result;
  }

  /**
   * Tìm thông tin nhận hàng tương ứng với mã đơn hàng.
   *
   * @param orderId - Mã đơn hàng cần tra cứu.
   * @returns Thông tin nhận hàng nếu tồn tại, ngược lại trả về null.
   */
  async findByDHId(orderId: string) {
    const result = await this.TTNhanHangDHRepo.findByDHId(orderId);
    if (!result) return null;
    const NH_diaChi = await this.DiaChiService.getFullAddressText(
      result.T_id,
      result.X_id
    );
    return {
      ...result,
      NH_diaChi,
    };
  }

  /**
   * Thống kê số lượng đơn hàng theo tỉnh/thành dựa trên danh sách mã đơn hàng.
   *
   * @param orderIds - Mảng chứa các mã đơn hàng cần thống kê.
   * @returns Mảng đối tượng gồm `provinceId` (mã tỉnh) và `count` (số lượng đơn hàng tương ứng).
   */
  async getStatsByProvince(orderIds: string[]) {
    return this.TTNhanHangDHRepo.getStatsByProvince(orderIds);
  }
}

@Injectable()
export class TTNhanHangKHService {
  constructor(
    private readonly TTNhanHangKHRepo: TTNhanHangKHRepository,
    private readonly DiaChiService: DiaChiService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới một địa chỉ nhận hàng cho khách hàng.
   *
   * @param data - Dữ liệu thông tin nhận hàng cần tạo, bao gồm các trường như họ tên, số điện thoại, mã tỉnh, mã huyện,...
   * @returns Đối tượng thông tin nhận hàng vừa được tạo.
   */
  async create(data: any): Promise<TTNhanHangKH> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // Kiểm tra khách hàng đã có địa chỉ chưa
      const existingAddresses = await this.TTNhanHangKHRepo.findAll(data.KH_id);
      const isFirstAddress = existingAddresses.length === 0;
      const shouldBeDefault = isFirstAddress || data.NH_macDinh;
      // Nếu địa chỉ mới được đặt là mặc định, unset các địa chỉ mặc định khác
      if (shouldBeDefault && !isFirstAddress) {
        await this.TTNhanHangKHRepo.unsetDefaultOthers(-1, data.KH_id, session); // -1 để bỏ qua NH_id (chưa có)
      }
      // Lấy NH_id cuối cùng của KH
      const lastId = await this.TTNhanHangKHRepo.findLastId(
        data.KH_id,
        session
      );
      const newId = lastId + 1;
      const newData = {
        ...data,
        NH_id: newId,
        NH_macDinh: shouldBeDefault,
      };
      const result = await this.TTNhanHangKHRepo.create(newData, session);
      if (!result)
        throw new BadRequestException(
          'Thêm thông tin nhận hàng khách hàng - Thêm thất bại'
        );
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (error.code === 11000) {
        throw new ConflictException();
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy toàn bộ danh sách địa chỉ nhận hàng của một khách hàng cụ thể.
   *
   * @param userId - ID của khách hàng cần lấy danh sách địa chỉ nhận hàng.
   * @returns Danh sách các địa chỉ nhận hàng của khách hàng dưới dạng mảng.
   */
  async findAll(userId: number) {
    const results = await this.TTNhanHangKHRepo.findAll(userId);
    // Thêm trường NH_diaChi cho từng kết quả
    const resultsWithAddress = await Promise.all(
      results.map(async (item) => {
        const NH_diaChi = await this.DiaChiService.getFullAddressText(
          item.T_id,
          item.X_id
        );
        return {
          ...item,
          NH_diaChi,
        };
      })
    );
    return resultsWithAddress;
  }

  /**
   * Lấy thông tin chi tiết một địa chỉ nhận hàng của khách hàng.
   *
   * @param id - ID của địa chỉ nhận hàng cần tìm.
   * @param userId - ID của khách hàng sở hữu địa chỉ nhận hàng.
   * @returns Đối tượng địa chỉ nhận hàng nếu tìm thấy, ngược lại trả về null.
   */
  async findOne(id: number, userId: number) {
    const data = await this.TTNhanHangKHRepo.findById(id, userId);
    if (!data) {
      throw new NotFoundException();
    }
    const NH_diaChi = await this.DiaChiService.getFullAddressText(
      data.T_id,
      data.X_id
    );
    return {
      ...data,
      NH_diaChi,
    };
  }

  /**
   * Cập nhật thông tin địa chỉ nhận hàng của khách hàng.
   *
   * @param id - ID của địa chỉ nhận hàng cần cập nhật.
   * @param userId - ID của khách hàng sở hữu địa chỉ nhận hàng.
   * @param data - Dữ liệu cần cập nhật cho địa chỉ nhận hàng.
   * @returns Đối tượng địa chỉ nhận hàng sau khi cập nhật.
   */
  async update(
    id: number,
    userId: number,
    data: Partial<TTNhanHangKH>
  ): Promise<TTNhanHangKH> {
    // Nếu không đặt mặc định thì chỉ cần update đơn giản
    if (data.NH_macDinh !== true) {
      const updated = await this.TTNhanHangKHRepo.update(id, userId, data);
      if (!updated) {
        throw new BadRequestException(
          'Cập nhật thông tin nhận hàng khách hàng - Không tồn tại'
        );
      }
      return updated;
    }
    // Nếu có đặt mặc định, cần dùng transaction
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // Hủy mặc định các bản ghi khác
      await this.TTNhanHangKHRepo.unsetDefaultOthers(id, userId, session);
      // Cập nhật bản ghi hiện tại
      const updated = await this.TTNhanHangKHRepo.update(
        id,
        userId,
        data,
        session
      );
      if (!updated) {
        throw new BadRequestException(
          'Cập nhật thông tin nhận hàng khách hàng - Không tồn tại'
        );
      }
      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Xóa địa chỉ nhận hàng của khách hàng theo ID.
   *
   * @param id - ID của địa chỉ nhận hàng cần xóa.
   * @param userId - ID của khách hàng sở hữu địa chỉ.
   * @returns Kết quả xóa (thường là đối tượng xác nhận từ MongoDB, ví dụ: { acknowledged: true, deletedCount: 1 }).
   */
  async delete(id: number, userId: number) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // Lấy thông tin địa chỉ cần xóa để kiểm tra có phải mặc định không
      const address = await this.TTNhanHangKHRepo.findById(id, userId);
      if (!address) {
        throw new BadRequestException(
          'Xóa thông tin nhận hàng khách hàng - Không tìm thấy địa chỉ cần xóa'
        );
      }
      // Xóa địa chỉ
      const result = await this.TTNhanHangKHRepo.delete(id, userId, session);
      if (result.deletedCount === 0) {
        throw new BadRequestException('Xóa thất bại');
      }
      // Nếu địa chỉ bị xóa là mặc định → kiểm tra các địa chỉ còn lại
      if (address.NH_macDinh) {
        const remaining = await this.TTNhanHangKHRepo.findAll(userId);
        const hasMacDinh = remaining.some((item) => item.NH_macDinh);
        if (!hasMacDinh && remaining.length > 0) {
          // Không còn địa chỉ mặc định nào → đặt cái đầu tiên làm mặc định
          const first = remaining[0];
          await this.TTNhanHangKHRepo.update(
            first.id,
            userId,
            { NH_macDinh: true },
            session
          );
        }
      }
      await session.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
