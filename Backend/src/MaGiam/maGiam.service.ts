import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MaGiamRepository } from './maGiam.repository';
import { MaGiam } from './maGiam.schema';
import { CreateDto, UpdateDto } from './maGiam.dto';
import { NhanVienUtilService } from 'src/NguoiDung/NhanVien/nhanVien.service';

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
  constructor(private readonly MaGiam: MaGiamRepository) {}

  async findValidByIds(ids: string[]) {
    return this.MaGiam.checkValid(ids);
  }
}

@Injectable()
export class MaGiamService {
  constructor(
    private readonly MaGiam: MaGiamRepository,
    private readonly NhanVien: NhanVienUtilService
  ) {}

  //=========================== Tạo mã giảm mới=======================================
  async create(data: CreateDto) {
    const existing = await this.MaGiam.findExisting(data.MG_id);
    if (existing) {
      throw new ConflictException();
    }

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: data.NV_id,
      thoiGian: new Date(),
    };

    // Tạo khuyến mãi chính
    const created = await this.MaGiam.create({
      ...data,
      lichSuThaoTac: [thaoTac],
    });

    if (!created) {
      throw new BadRequestException();
    }

    return created;
  }

  //=========== Lấy danh sách mã giảm phân trang và theo trạng thái, loại  ==============
  async getAll(params: {
    page: number;
    limit: number;
    filterType?: number;
    type?: number;
  }) {
    return this.MaGiam.findAll(params);
  }

  async getAllValid() {
    return this.MaGiam.findAllValid();
  }

  // =======================Lấy chi tiết mã giảm theo id==========================
  async getById(id: string, filterType?: number, type?: number): Promise<any> {
    const result: any = await this.MaGiam.findById(id, filterType, type);
    if (!result) {
      throw new NotFoundException();
    }
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    return result;
  }

  // ==================== Cập nhật mã giảm =======================================
  async update(
    id: string,
    newData: UpdateDto,
    filterType?: number
  ): Promise<MaGiam> {
    // Tìm bản ghi hiện tại theo id
    const current = await this.MaGiam.findById(id, filterType);
    if (!current) {
      throw new NotFoundException();
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

    const updated = await this.MaGiam.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException('Cập nhật thất bại');
    }

    return updated;
  }

  async countValid(): Promise<number> {
    return this.MaGiam.countValid();
  }
}
