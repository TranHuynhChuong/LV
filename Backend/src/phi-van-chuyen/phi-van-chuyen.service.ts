import {
  ConflictException,
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { NhanVienUtilService } from '../nguoi-dung/nhan-vien/nhan-vien.service';
import { PhiVanChuyenRepository } from './repositories/phi-van-chuyen.repository';
import { PhiVanChuyen } from './schemas/phi-van-chuyen.schema';
import { CreatePhiVanChuyenDto } from './dto/create-phi-van-chuyen.dto';
import { UpdatePhiVanChuyenDto } from './dto/update-phi-van-chuyen.dto';
import { DiaChiService } from '../dia-chi/dia-chi.service';

const typeOfChange: Record<string, string> = {
  PVC_phi: 'Phí',
  PVC_ntl: 'Ngưỡng khối lượng',
  PVC_phuPhi: 'Phụ phí',
  PVC_dvpp: 'Đơ vị phụ phí',
  T_id: 'Khu vực',
};

@Injectable()
export class PhiVanChuyenService {
  constructor(
    private readonly PhiVanChuyenRepo: PhiVanChuyenRepository,
    private readonly NhanVienService: NhanVienUtilService,
    private readonly DiaChiService: DiaChiService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới phí vận chuyển hoặc khôi phục phí đã xóa.
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
          const thaoTac = {
            thaoTac: 'Khôi phục & cập nhật',
            NV_id: newData.NV_id,
            thoiGian: new Date(),
          };
          const updated = await this.PhiVanChuyenRepo.update(exists.PVC_id, {
            ...newData,
            PVC_daXoa: false,
            lichSuThaoTac: [...(exists.lichSuThaoTac || []), thaoTac],
          });
          if (!updated) {
            throw new BadRequestException(
              'Tạo phí vận chuyển - Không thể khôi phục phí vận chuyển'
            );
          }
          result = updated;
        } else {
          const lastId = await this.PhiVanChuyenRepo.findLastId(session);
          const newId = lastId + 1;
          const thaoTac = {
            thaoTac: 'Tạo mới',
            NV_id: newData.NV_id,
            thoiGian: new Date(),
          };
          const created = await this.PhiVanChuyenRepo.create({
            ...newData,
            PVC_id: newId,
            lichSuThaoTac: [thaoTac],
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
   * @param id - ID phí vận chuyển.
   * @returns Bản ghi phí vận chuyển.
   */
  async getById(id: number): Promise<any> {
    const result: any = await this.PhiVanChuyenRepo.findById(id);
    if (!result) {
      throw new NotFoundException(
        'Tìm phí vận chuyển - Không tồn tại phí vận chuyển'
      );
    }
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];
    return result;
  }

  /**
   * Lấy phí vận chuyển theo T_id (khu vực), fallback về khu vực còn lại (T_id = 0) nếu không có.
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
    const fieldsChange: string[] = [];
    const updatePayload: any = {};
    for (const key of Object.keys(newData)) {
      if (
        newData[key] !== undefined &&
        newData[key] !== existing[key] &&
        key !== 'NV_id'
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newData[key]; // chỉ thêm trường có thay đổi
      }
    }
    if (fieldsChange.length > 0 && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };
      updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    }
    // Nếu không có gì thay đổi, trả về bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }
    const updated = await this.PhiVanChuyenRepo.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException(
        'Cập nhật phí vận chuyển - Cập nhật phí vận chuyển thất bại'
      );
    }
    return updated;
  }

  /**
   * Xoá (mềm) phí vận chuyển và lưu lịch sử thao tác.
   * @param id - PVC_id cần xóa.
   * @param NV_id - ID nhân viên thực hiện thao tác.
   * @returns Bản ghi sau khi bị đánh dấu xoá.
   */
  async delete(id: number, NV_id: string): Promise<PhiVanChuyen> {
    const existing = await this.PhiVanChuyenRepo.findById(id);
    if (!existing)
      throw new BadRequestException(
        'Xóa phí vận chuyển - Phí vận chuyển không tồn tại'
      );
    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };
    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    const deleted = await this.PhiVanChuyenRepo.update(id, {
      PVC_daXoa: true,
      lichSuThaoTac: lichSuThaoTac,
    });
    if (!deleted) {
      throw new BadRequestException(
        'Xóa phí vận chuyển - Xóa phí vận chuyển thất bại'
      );
    }
    return deleted;
  }

  /**
   * Đếm tổng số bản ghi phí vận chuyển chưa bị xoá.
   * @returns Tổng số bản ghi còn hiệu lực.
   */
  async countAll(): Promise<number> {
    return this.PhiVanChuyenRepo.countAll();
  }
}
