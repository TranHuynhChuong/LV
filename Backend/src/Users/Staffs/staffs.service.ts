import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffsRepository } from './staffs.repository';
import { CreateStaffDto, UpdateStaffDto } from './staffs.dto';

@Injectable()
export class StaffsService {
  constructor(private readonly Staff: StaffsRepository) {}

  async create(newStaff: CreateStaffDto) {
    const lastCode = await this.Staff.findLastId();
    const length = 7;
    const numericCode = parseInt(lastCode, 10);
    const newNumericCode = numericCode + 1;
    const newCode = newNumericCode.toString().padStart(length, '0');

    return this.Staff.create({ ...newStaff, NV_id: newCode });
  }

  async findAll() {
    const result = {};
    result['staffs'] = await this.Staff.findAll();
    result['total'] = await this.Staff.countAll();
    return result;
  }

  async findById(id: string) {
    const Staff = await this.Staff.findById(id);
    if (!Staff) throw new NotFoundException('Không tìm thấy nhân viên');

    let NV_idNV: {
      NV_id: string;
      NV_hoTen: string;
      NV_email: string;
      NV_soDienThoai: string;
    } | null = null; // Khởi tạo null mặc định

    const NV = await this.Staff.findById(Staff.NV_idNV);
    if (NV) {
      NV_idNV = {
        NV_id: NV.NV_id,
        NV_hoTen: NV.NV_hoTen,
        NV_email: NV.NV_email,
        NV_soDienThoai: NV.NV_soDienThoai,
      };
    }

    return { staff: Staff, NV_idNV: NV_idNV };
  }

  async update(id: string, dto: UpdateStaffDto) {
    const staff = await this.Staff.update(id, dto);
    if (!staff) throw new NotFoundException('Không tìm thấy nhân viên');
    return staff;
  }

  async delete(id: string) {
    const staff = await this.Staff.delete(id);
    if (!staff) throw new NotFoundException('Không tìm thấy nhân viên');
    return staff;
  }

  async countAll() {
    return this.Staff.countAll();
  }
}
