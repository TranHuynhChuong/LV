import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NhanVienRepository } from './repositories/nhan-vien.repository';
import { NhanVien } from './schemas/nhan-vien.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CreateNhanVienDto } from './dto/create-nhan-vien.dto';
import { UpdateNhanVienDto } from './dto/update-nhan-vien.dto';
import { getNextSequence } from 'src/Util/counter.service';
import { NhanVienResponseDto } from './dto/response-nhan-vien.dto';
import { plainToInstance } from 'class-transformer';
import { LichSuThaoTacService } from 'src/lich-su-thao-tac/lich-su-thao-tac.service';
import { DULIEU } from 'src/lich-su-thao-tac/schemas/lich-su-thao-tac.schema';

/**
 * Bản đồ vai trò từ mã số sang tên mô tả.
 */
const Role: Record<number, string | null> = {
  0: null,
  1: 'Quản trị',
  2: 'Quản lý',
  3: 'Bán Hàng',
};

@Injectable()
export class NhanVienUtilService {
  constructor(private readonly NhanVienRepo: NhanVienRepository) {}

  /**
   * Lấy thông tin của nhiều nhân viên theo danh sách ID.
   *
   * @param ids Danh sách mã NV_id cần tìm
   * @returns Danh sách đối tượng nhân viên tương ứng
   */
  public async findAllIds(ids: string[]) {
    const results = await this.NhanVienRepo.findAllIds(ids);
    return results.map((r) => ({
      ...r,
      NV_tenVaiTro:
        r.NV_vaiTro != null ? (Role[r.NV_vaiTro] ?? 'Không xác định') : null,
    }));
  }

  /**
   * Tìm nhân viên theo ID và thêm tên vai trò vào kết quả.
   *
   * @param id Mã định danh NV_id của nhân viên
   * @returns Nhân viên kèm tên vai trò (NV_tenVaiTro)
   */
  async findById(id: string): Promise<NhanVien & { NV_tenVaiTro: string }> {
    const result = await this.NhanVienRepo.findUnBlockById(id);
    if (!result) {
      throw new NotFoundException('Tìm nhân viên - Không tìm thấy nhân viên');
    }
    return {
      ...result,
      NV_tenVaiTro: Role[result.NV_vaiTro] ?? 'Không xác định',
    };
  }
}

@Injectable()
export class NhanVienService {
  private readonly codeLength = 7;

  constructor(
    private readonly NhanVienRepo: NhanVienRepository,
    private readonly LichSuThaoTacService: LichSuThaoTacService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới một nhân viên.
   *
   * @param newData Thông tin nhân viên mới
   * @returns Đối tượng nhân viên vừa được tạo
   */
  async create(newData: CreateNhanVienDto): Promise<NhanVien> {
    const session = await this.connection.startSession();
    try {
      let result: NhanVien;
      await session.withTransaction(async () => {
        if (!this.connection.db) {
          throw new Error('Không thể kết nối cơ sở dữ liệu');
        }
        // Lấy giá trị seq tự tăng từ MongoDB
        const seq = await getNextSequence(
          this.connection.db,
          'staffId',
          session
        );
        const newCode = seq.toString().padStart(this.codeLength, '0');
        const created = await this.NhanVienRepo.create(
          {
            ...newData,
            NV_id: newCode,
          },
          session
        );
        if (!created)
          throw new BadRequestException(
            'Tạo nhân viên - Tạo nhân viên thất bại'
          );

        await this.LichSuThaoTacService.create({
          actionType: 'create',
          staffId: newData.NV_idNV ?? '',
          dataName: DULIEU.ACCOUNT,
          dataId: newCode,
          session: session,
        });

        result = created;
      });
      return result!;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy tất cả nhân viên chưa bị xóa mềm.
   *
   * @returns Danh sách nhân viên
   */
  async findAll(): Promise<NhanVienResponseDto[]> {
    const result = await this.NhanVienRepo.findAll();
    const mapResult = result.map((staff) => ({
      ...staff,
      NV_tenVaiTro: Role[staff.NV_vaiTro] ?? 'Không xác định',
    }));
    return plainToInstance(NhanVienResponseDto, mapResult);
  }

  /**
   * Tìm chi tiết nhân viên theo ID, bao gồm lịch sử thao tác đã ánh xạ.
   *
   * @param id Mã NV_id của nhân viên
   * @returns Nhân viên và lịch sử thao tác đã xử lý
   * @throws NotFoundException khi không timg thấy.
   */
  async findById(id: string): Promise<any> {
    const result = await this.NhanVienRepo.findById(id);
    if (!result) {
      throw new NotFoundException('Tìm nhân viên - Không tìm thấy nhân viên');
    }
    return plainToInstance(NhanVienResponseDto, result);
  }

  /**
   * Cập nhật thông tin nhân viên và ghi lại các trường đã thay đổi.
   *
   * @param id Mã NV_id của nhân viên
   * @param newData Dữ liệu cập nhật
   * @returns Nhân viên sau khi cập nhật
   */
  async update(id: string, newData: UpdateNhanVienDto): Promise<NhanVien> {
    const existing = await this.NhanVienRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(
        'Cập nhật nhân viên - Không tìm thấy nhân viên'
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { updatePayload } = await this.LichSuThaoTacService.create({
        actionType: 'update',
        staffId: newData.NV_idNV ?? '',
        dataName: DULIEU.ACCOUNT,
        dataId: existing.NV_id,
        newData: newData,
        existingData: existing,
        ignoreFields: ['NV_idNV'],
        session: session,
      });
      const updated = await this.NhanVienRepo.update(id, updatePayload);
      if (!updated) {
        throw new BadRequestException(
          'Cập nhật nhân viên - Cập nhật nhân viên thất bại'
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
   * Đếm tổng số nhân viên trong hệ thống.
   *
   * @returns Số lượng nhân viên
   */
  async countAll(): Promise<number> {
    return await this.NhanVienRepo.countAll();
  }
}
