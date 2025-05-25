import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { KhachHangRepository } from './khachHang.repository';
import { CreateDto, UpdateDto } from './khachHang.dto';

@Injectable()
export class KhachHangsService {
  constructor(private readonly KhachHang: KhachHangRepository) {}

  async create(data: CreateDto) {
    const existing = await this.KhachHang.findByEmail(data.KH_email);
    if (existing) {
      throw new ConflictException('Email đã được đăng ký tài khoản');
    }
    const created = await this.KhachHang.create(data);
    if (!created) {
      throw new ConflictException('Tạo khách hàng thất bại');
    }
    return created;
  }

  async findAll(page = 0, limit = 24) {
    page = page < 0 ? 0 : page;
    limit = limit <= 0 ? 24 : limit;

    const results = await this.KhachHang.findAll(page, limit);
    const total = await this.KhachHang.countAll();

    return { results, total };
  }

  async update(email: string, data: UpdateDto) {
    const updated = await this.KhachHang.update(email, data);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    return updated;
  }

  async findByEmail(email: string) {
    const result = await this.KhachHang.findByEmail(email);
    if (!result) {
      throw new NotFoundException('Không tìm thấy khách hàng với email này');
    }
    return result;
  }

  async updateEmail(email: string, newEmail: string) {
    const existing = await this.KhachHang.findByEmail(newEmail);
    if (existing) {
      throw new ConflictException('Email mới đã được đăng ký');
    }

    const updated = await this.KhachHang.updateEmail(email, newEmail);
    if (!updated) {
      throw new NotFoundException(
        'Không tìm thấy khách hàng để cập nhật email'
      );
    }
    return updated;
  }

  async countAll() {
    return await this.KhachHang.countAll();
  }

  async countByMonth(year = new Date().getFullYear()) {
    return await this.KhachHang.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
