import {
  ConflictException,
  NotFoundException,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PhiVanChuyenRepository } from './repositories/phi-van-chuyen.repository';
import { PhiVanChuyen } from './schemas/phi-van-chuyen.schema';
import { CreatePhiVanChuyenDto } from './dto/create-phi-van-chuyen.dto';
import { UpdatePhiVanChuyenDto } from './dto/update-phi-van-chuyen.dto';
import { DiaChiService } from '../dia-chi/dia-chi.service';
import { getNextSequence } from 'src/Util/counter.service';
import { DULIEU } from 'src/lich-su-thao-tac/schemas/lich-su-thao-tac.schema';
import { LichSuThaoTacService } from 'src/lich-su-thao-tac/lich-su-thao-tac.service';

@Injectable()
export class PhiVanChuyenService {
  constructor(
    private readonly PhiVanChuyenRepo: PhiVanChuyenRepository,
    private readonly DiaChiService: DiaChiService,
    private readonly LichSuThaoTacService: LichSuThaoTacService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới phí vận chuyển hoặc khôi phục phí đã xóa.
   *
   * @param newData - Dữ liệu tạo phí vận chuyển.
   * @returns Bản ghi phí vận chuyển đã được tạo hoặc khôi phục.
   */
  async create(newData: CreatePhiVanChuyenDto): Promise<PhiVanChuyen> {
    const session = await this.connection.startSession();
    try {
      let result: PhiVanChuyen;
      await session.withTransaction(async () => {
        const exists = await this.PhiVanChuyenRepo.findByProvinceId(
          newData.T_id
        );
        if (exists) {
          if (!exists.PVC_daXoa) {
            throw new ConflictException(
              'Tạo phí vận chuyển - Khu vực đã được thiết lập phí vận chuyển'
            );
          }
          await this.LichSuThaoTacService.create({
            actionType: 'create',
            staffId: newData.NV_id ?? '',
            dataName: DULIEU.SHIPPINGFEE,
            dataId: exists.PVC_id,
            session: session,
          });
          const updated = await this.PhiVanChuyenRepo.update(exists.PVC_id, {
            ...newData,
            PVC_daXoa: false,
            session,
          });
          if (!updated) {
            throw new BadRequestException(
              'Tạo phí vận chuyển - Không thể khôi phục phí vận chuyển'
            );
          }
          result = updated;
        } else {
          if (!this.connection.db) {
            throw new Error('Không thể kết nối cơ sở dữ liệu');
          }
          // Lấy giá trị seq tự tăng từ MongoDB
          const seq = await getNextSequence(
            this.connection.db,
            'shippingId',
            session
          );
          await this.LichSuThaoTacService.create({
            actionType: 'create',
            staffId: newData.NV_id ?? '',
            dataName: DULIEU.SHIPPINGFEE,
            dataId: seq,
            session: session,
          });
          const created = await this.PhiVanChuyenRepo.create({
            ...newData,
            PVC_id: seq,
            session,
          });
          if (!created) {
            throw new BadRequestException(
              'Tạo phí vận chuyển - Tạo phí vận chuyển thất bại'
            );
          }
          result = created;
        }
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy tất cả phí vận chuyển kèm tên khu vực.
   *
   * @returns Danh sách phí vận chuyển.
   */
  async getAll(): Promise<Partial<PhiVanChuyen & { T_ten: string }>[]> {
    const data = await this.PhiVanChuyenRepo.findAll();
    const result = await Promise.all(
      data.map(async (item) => {
        const province =
          item.T_id !== undefined
            ? await this.DiaChiService.getProvinceInfo(item.T_id)
            : undefined;
        return {
          ...item,
          T_ten: item.T_id === 0 ? 'Khu vực còn lại' : province?.T_ten,
        };
      })
    );
    return result;
  }

  /**
   * Lấy phí vận chuyển theo PVC_id.
   *
   * @param id - ID phí vận chuyển.
   * @returns Bản ghi phí vận chuyển.
   */
  async getById(id: number) {
    const result = await this.PhiVanChuyenRepo.findById(id);
    if (!result) {
      throw new NotFoundException(
        'Tìm phí vận chuyển - Không tồn tại phí vận chuyển'
      );
    }
    return result;
  }

  /**
   * Lấy phí vận chuyển theo T_id (khu vực), fallback về khu vực còn lại (T_id = 0) nếu không có.
   *
   * @param id - T_id khu vực.
   * @returns Phí vận chuyển tương ứng.
   */
  async getByProvinceId(id: number): Promise<PhiVanChuyen> {
    let result = await this.PhiVanChuyenRepo.findByProvinceId(id);
    result ??= await this.PhiVanChuyenRepo.findByProvinceId(0);
    if (!result) {
      throw new NotFoundException(
        'Tìm phí vận chuyển - Chưa tồn tại phí vận chuyển nào'
      );
    }
    return result;
  }

  /**
   * Cập nhật thông tin phí vận chuyển.
   *
   * @param id - PVC_id bản ghi cần cập nhật.
   * @param newData - Dữ liệu cập nhật.
   * @returns Bản ghi sau khi cập nhật.
   */
  async update(
    id: number,
    newData: UpdatePhiVanChuyenDto
  ): Promise<PhiVanChuyen> {
    const existing = await this.PhiVanChuyenRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(
        'Cập nhật phí vận chuyển - Không tìm thấy phí vận chuyển'
      );
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { updatePayload } = await this.LichSuThaoTacService.create({
        actionType: 'update',
        staffId: newData.NV_id ?? '',
        dataName: DULIEU.SHIPPINGFEE,
        dataId: id,
        newData: newData,
        existingData: existing,
        ignoreFields: ['NV_id'],
        session: session,
      });
      const updated = await this.PhiVanChuyenRepo.update(
        id,
        updatePayload,
        session
      );
      if (!updated) {
        throw new BadRequestException(
          'Cập nhật phí vận chuyển - Cập nhật phí vận chuyển thất bại'
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
   * Xoá (mềm) phí vận chuyển và lưu lịch sử thao tác.
   *
   * @param id - PVC_id cần xóa.
   * @param staffId - ID nhân viên thực hiện thao tác.
   * @returns Bản ghi sau khi bị đánh dấu xoá.
   */
  async delete(id: number, staffId: string): Promise<PhiVanChuyen> {
    const existing = await this.PhiVanChuyenRepo.findById(id);
    if (!existing)
      throw new BadRequestException(
        'Xóa phí vận chuyển - Phí vận chuyển không tồn tại'
      );
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.LichSuThaoTacService.create({
        actionType: 'delete',
        staffId: staffId ?? '',
        dataName: DULIEU.SHIPPINGFEE,
        dataId: id,
        session: session,
      });
      const deleted = await this.PhiVanChuyenRepo.update(id, {
        PVC_daXoa: true,
        session,
      });
      if (!deleted) {
        throw new BadRequestException(
          'Xóa phí vận chuyển - Xóa phí vận chuyển thất bại'
        );
      }
      await session.commitTransaction();
      return deleted;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(
        `Xóa phí vận chuyển - ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Đếm tổng số bản ghi phí vận chuyển chưa bị xoá.
   *
   * @returns Tổng số bản ghi còn hiệu lực.
   */
  async countAll(): Promise<number> {
    return this.PhiVanChuyenRepo.countAll();
  }
}
