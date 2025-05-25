import { Injectable, NotFoundException } from '@nestjs/common';
import { NhanVienRepository } from './nhanVien.repository';
import { CreateDto, UpdateDto } from './nhanVien.dto';

export interface NhanVienInfo {
  NV_id: string | null;
  NV_hoTen: string | null;
  NV_email: string | null;
  NV_soDienThoai: string | null;
}

@Injectable()
export class NhanVienService {
  private readonly codeLength = 7;

  constructor(private readonly NhanVien: NhanVienRepository) {}

  async create(newData: CreateDto) {
    const lastCode = await this.NhanVien.findLastId();
    const numericCode = lastCode ? parseInt(lastCode, 10) : 0;
    const newNumericCode = numericCode + 1;
    const newCode = newNumericCode.toString().padStart(this.codeLength, '0');

    const created = await this.NhanVien.create({
      ...newData,
      NV_id: newCode,
    });
    if (!created) {
      throw new NotFoundException('Tạo nhân viên thất bại');
    }
    return created;
  }

  async findAll() {
    const results = await this.NhanVien.findAll();
    return results;
  }

  async findById(id: string): Promise<any> {
    const result: any = await this.NhanVien.findById(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    let NV_idNV: NhanVienInfo = {
      NV_id: result.NV_idNV,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (result.NV_idNV) {
      const parentNhanVien = await this.NhanVien.findById(result.NV_idNV);
      if (parentNhanVien) {
        NV_idNV = {
          NV_id: parentNhanVien.NV_id,
          NV_hoTen: parentNhanVien.NV_hoTen,
          NV_email: parentNhanVien.NV_email,
          NV_soDienThoai: parentNhanVien.NV_soDienThoai,
        };
        result.NV_idNV = NV_idNV;
      }
    }

    return result;
  }

  async update(id: string, dto: UpdateDto) {
    const updated = await this.NhanVien.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.NhanVien.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return deleted;
  }

  async countAll() {
    return await this.NhanVien.countAll();
  }
}
