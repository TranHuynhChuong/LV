import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffsRepository } from './staffs.repository';
import { CreateStaffDto, UpdateStaffDto } from './staffs.dto';

@Injectable()
export class StaffsService {
  constructor(private readonly Staff: StaffsRepository) {}

  async create(newStaff: CreateStaffDto) {
    return this.Staff.create(newStaff);
  }

  async findAll() {
    const result = {};
    result['staff'] = await this.Staff.findAll();
    result['total'] = await this.Staff.countAll();
    return result;
  }

  async findOneById(id: string) {
    const Staff = await this.Staff.findOneById(id);
    if (!Staff) throw new NotFoundException('Không tìm thấy nhân viên');
    return Staff;
  }

  async findByCode(code: string) {
    const staff = await this.Staff.findByCode(code);
    if (!staff) throw new NotFoundException('Không tìm thấy mã nhân viên');
    return staff;
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
