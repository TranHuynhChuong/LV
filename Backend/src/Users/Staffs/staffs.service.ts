import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffsRepository } from './staffs.repository';
import { CreateStaffDto, UpdateStaffDto } from './staffs.dto';

export interface StaffInfo {
  NV_id: string | null;
  NV_hoTen: string | null;
  NV_email: string | null;
  NV_soDienThoai: string | null;
}

@Injectable()
export class StaffsService {
  private readonly codeLength = 7;

  constructor(private readonly staffRepository: StaffsRepository) {}

  async create(newStaff: CreateStaffDto) {
    const lastCode = await this.staffRepository.findLastId();
    const numericCode = lastCode ? parseInt(lastCode, 10) : 0;
    const newNumericCode = numericCode + 1;
    const newCode = newNumericCode.toString().padStart(this.codeLength, '0');

    const created = await this.staffRepository.create({
      ...newStaff,
      NV_id: newCode,
    });
    if (!created) {
      throw new NotFoundException('Tạo nhân viên thất bại');
    }
    return created;
  }

  async findAll() {
    const staffs = await this.staffRepository.findAll();
    const total = await this.staffRepository.countAll();
    return { staffs, total };
  }

  async findById(id: string): Promise<{ staff: any; NV_idNV: StaffInfo }> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    let NV_idNV: StaffInfo = {
      NV_id: null,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (staff.NV_idNV) {
      const parentStaff = await this.staffRepository.findById(staff.NV_idNV);
      if (parentStaff) {
        NV_idNV = {
          NV_id: parentStaff.NV_id,
          NV_hoTen: parentStaff.NV_hoTen,
          NV_email: parentStaff.NV_email,
          NV_soDienThoai: parentStaff.NV_soDienThoai,
        };
      }
    }

    return { staff, NV_idNV };
  }

  async update(id: string, dto: UpdateStaffDto) {
    const updated = await this.staffRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.staffRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return deleted;
  }

  async countAll() {
    return await this.staffRepository.countAll();
  }
}
