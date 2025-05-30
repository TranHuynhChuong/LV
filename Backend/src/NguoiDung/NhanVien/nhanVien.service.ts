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

export interface NhanVienInfo {
  NV_id: string | null;
  NV_hoTen: string | null;
  NV_email: string | null;
  NV_soDienThoai: string | null;
}

const fieldFriendlyNames: Record<string, string> = {
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
      lichSuThaoTacNV: [thaoTac],
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

    // Cập nhật thông tin chi tiết cho từng NV_id trong lịch sử thao tác
    if (Array.isArray(result.lichSuThaoTacNV)) {
      result.lichSuThaoTacNV = await Promise.all(
        result.lichSuThaoTacNV.map(
          async (element: LichSuThaoTacNV): Promise<ThaoTac> => {
            const nhanVien = await this.NhanVien.findById(element.NV_id);
            const thaoTac: ThaoTac = {
              thaoTac: element.thaoTac,
              thoiGian: element.thoiGian,
              nhanVien: {
                NV_id: null,
                NV_hoTen: null,
                NV_email: null,
                NV_soDienThoai: null,
              },
            };
            if (nhanVien) {
              result.nhanVien = {
                NV_id: nhanVien.NV_id,
                NV_hoTen: nhanVien.NV_hoTen,
                NV_email: nhanVien.NV_email,
                NV_soDienThoai: nhanVien.NV_soDienThoai,
              };
            }
            return thaoTac;
          }
        )
      );
    }

    return result;
  }

  async update(id: string, newData: UpdateDto): Promise<NhanVien> {
    const existing = await this.NhanVien.findById(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhân viên.');
    }

    const fieldsThayDoi: string[] = [];
    for (const key of Object.keys(newData)) {
      if (
        key !== 'NV_idNV' &&
        newData[key] !== undefined &&
        newData[key] !== existing[key]
      ) {
        const label = fieldFriendlyNames[key] || key;
        fieldsThayDoi.push(label);
      }
    }

    const newLichSuThaoTacNV = [...existing.lichSuThaoTacNV];
    if (fieldsThayDoi.length > 0 && newData.NV_idNV) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsThayDoi.join(', ')}`,
        NV_id: newData.NV_idNV,
        thoiGian: new Date(),
      };
      newLichSuThaoTacNV.push(thaoTac);
    }

    // Tạo đối tượng cập nhật đúng
    const updateObject = {
      ...newData,
      lichSuThaoTacNV: newLichSuThaoTacNV,
    };

    const updated = await this.NhanVien.update(id, updateObject);
    if (!updated) {
      throw new BadRequestException();
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
}
