import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NhanVienRepository } from './nhanVien.repository';
import { CreateDto, UpdateDto } from './nhanVien.dto';
import { NhanVien, LichSuThaoTacNV } from './nhanVien.schema';

export interface ThaoTac {
  thoiGian: Date;
  thaoTac: string;
  nhanVien: {
    NV_id: string | null;
    NV_hoTen: string | null;
    NV_email: string | null;
    NV_soDienThoai: string | null;
  };
}

const typeOfChange: Record<string, string> = {
  NV_hoTen: 'Họ tên',
  NV_email: 'Email',
  NV_soDienThoai: 'Số điện thoại',
  NV_vaiTro: 'Vai trò',
  NV_matKhau: 'Mật khẩu',
};

@Injectable()
export class NhanVienService {
  private readonly codeLength = 7;

  constructor(private readonly NhanVien: NhanVienRepository) {}

  async create(newData: CreateDto): Promise<NhanVien> {
    const lastCode = await this.NhanVien.findLastId();
    const numericCode = lastCode ? parseInt(lastCode, 10) : 0;
    const newNumericCode = numericCode + 1;
    const newCode = newNumericCode.toString().padStart(this.codeLength, '0');

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: newData.NV_idNV,
      thoiGian: new Date(),
    };

    const created = await this.NhanVien.create({
      ...newData,
      NV_id: newCode,
      lichSuThaoTac: [thaoTac],
    });

    if (!created) {
      throw new BadRequestException();
    }
    return created;
  }

  async findAll(): Promise<NhanVien[]> {
    return await this.NhanVien.findAll();
  }

  async findById(id: string): Promise<any> {
    const result: any = await this.NhanVien.findById(id);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac || [];

    const ids = [
      ...new Set(
        lichSu.map((item: LichSuThaoTacNV) => item.NV_id).filter(Boolean)
      ),
    ] as string[];
    const nhanViens = await this.NhanVien.findAllIds(ids);
    const nhanVienMap = new Map<string, any>();
    nhanViens.forEach((nv) => {
      nhanVienMap.set(nv.NV_id, nv);
    });

    result.lichSuThaoTac = lichSu.map((item): ThaoTac => {
      const nv = nhanVienMap.get(item.NV_id);

      return {
        thoiGian: item.thoiGian,
        thaoTac: item.thaoTac,
        nhanVien: {
          NV_id: nv?.NV_id ?? null,
          NV_hoTen: nv?.NV_hoTen ?? null,
          NV_email: nv?.NV_email ?? null,
          NV_soDienThoai: nv?.NV_soDienThoai ?? null,
        },
      };
    });

    return result;
  }

  async update(id: string, newData: UpdateDto): Promise<NhanVien> {
    const existing = await this.NhanVien.findById(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const fieldsChange: string[] = [];
    const updatePayload: any = {};

    for (const key of Object.keys(newData)) {
      if (
        newData[key] !== undefined &&
        newData[key] !== existing[key] &&
        key !== 'NV_idNV'
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newData[key]; // Chỉ thêm trường thực sự thay đổi
      }
    }

    if (fieldsChange.length > 0 && newData.NV_idNV) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_idNV,
        thoiGian: new Date(),
      };

      updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    }

    // Nếu không có trường nào thay đổi thì trả về bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }

    const updated = await this.NhanVien.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException('Cập nhật thất bại');
    }

    return updated;
  }

  async delete(id: string) {
    const deleted = await this.NhanVien.delete(id);
    if (!deleted) {
      throw new BadRequestException();
    }
    return deleted;
  }

  async countAll(): Promise<number> {
    return await this.NhanVien.countAll();
  }

  async findAllIds(ids: string[]) {
    return this.NhanVien.findAllIds(ids);
  }
}
