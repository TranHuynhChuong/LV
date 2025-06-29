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
@Injectable()
export class TTNhanHangDHService {
  constructor(private readonly TTNhanHangDHRepo: TTNhanHangDHRepository) {}

  async create(data: Partial<TTNhanHangDH>, session?: ClientSession) {
    const result = await this.TTNhanHangDHRepo.createDH(data, session);
    if (!result) {
      throw new BadRequestException(
        'Tạo thông tin nhận hàng đơn hàng - Tạo thất bại'
      );
    }
    return result;
  }

  async findByDHId(DH_id: string) {
    return this.TTNhanHangDHRepo.findByDHId(DH_id);
  }

  async findByTinhId(T_id: number) {
    return this.TTNhanHangDHRepo.findByTId(T_id);
  }

  async getStatsByProvince(dhIds: string[]) {
    return this.TTNhanHangDHRepo.getStatsByProvince(dhIds);
  }
}

@Injectable()
export class TTNhanHangKHService {
  constructor(
    private readonly TTNhanHangKHRepo: TTNhanHangKHRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  // Tạo mới thông tin nhận hàng
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

  // Lấy danh sách theo KH
  async findAll(KH_id: number) {
    return this.TTNhanHangKHRepo.findAll(KH_id);
  }

  // Lấy 1 bản ghi theo NH_id
  async findOne(NH_id: number, KH_id: number): Promise<TTNhanHangKH> {
    const data = await this.TTNhanHangKHRepo.findById(NH_id, KH_id);
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }

  // Cập nhật
  async update(
    NH_id: number,
    KH_id: number,
    data: Partial<TTNhanHangKH>
  ): Promise<TTNhanHangKH> {
    // Nếu không đặt mặc định thì chỉ cần update đơn giản
    if (data.NH_macDinh !== true) {
      const updated = await this.TTNhanHangKHRepo.update(NH_id, KH_id, data);
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
      await this.TTNhanHangKHRepo.unsetDefaultOthers(NH_id, KH_id, session);

      // Cập nhật bản ghi hiện tại
      const updated = await this.TTNhanHangKHRepo.update(
        NH_id,
        KH_id,
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

  // Xóa
  async delete(NH_id: number, KH_id: number) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Lấy thông tin địa chỉ cần xóa để kiểm tra có phải mặc định không
      const address = await this.TTNhanHangKHRepo.findById(NH_id, KH_id);
      if (!address) {
        throw new BadRequestException(
          'Xóa thông tin nhận hàng khách hàng - Không tìm thấy địa chỉ cần xóa'
        );
      }

      // Xóa địa chỉ
      const result = await this.TTNhanHangKHRepo.delete(NH_id, KH_id, session);
      if (result.deletedCount === 0) {
        throw new BadRequestException('Xóa thất bại');
      }

      // Nếu địa chỉ bị xóa là mặc định → kiểm tra các địa chỉ còn lại
      if (address.NH_macDinh) {
        const remaining = await this.TTNhanHangKHRepo.findAll(KH_id);

        const hasMacDinh = remaining.some((item) => item.NH_macDinh);
        if (!hasMacDinh && remaining.length > 0) {
          // Không còn địa chỉ mặc định nào → đặt cái đầu tiên làm mặc định
          const first = remaining[0];
          await this.TTNhanHangKHRepo.update(
            first.NH_id,
            KH_id,
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
