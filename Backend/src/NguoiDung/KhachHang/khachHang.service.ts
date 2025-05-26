import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { KhachHangRepository } from './khachHang.repository';
import { CreateDto, UpdateDto } from './khachHang.dto';
import { KhachHang } from './khachHang.schema';

@Injectable()
export class KhachHangsService {
  constructor(private readonly KhachHang: KhachHangRepository) {}

  async create(data: CreateDto): Promise<KhachHang> {
    const existing = await this.KhachHang.findByEmail(data.KH_email);
    if (existing) {
      throw new ConflictException();
    }
    const created = await this.KhachHang.create(data);
    if (!created) {
      throw new BadRequestException();
    }
    return created;
  }

  async findAll(
    page = 0,
    limit = 24
  ): Promise<{ results: KhachHang[]; total: number }> {
    page = page < 0 ? 0 : page;
    limit = limit <= 0 ? 24 : limit;

    const results = await this.KhachHang.findAll(page, limit);
    const total = await this.KhachHang.countAll();

    return { results, total };
  }

  async update(email: string, data: UpdateDto): Promise<KhachHang> {
    const updated = await this.KhachHang.update(email, data);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
  }

  async findByEmail(email: string): Promise<KhachHang> {
    const result = await this.KhachHang.findByEmail(email);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async updateEmail(email: string, newEmail: string): Promise<KhachHang> {
    const existing = await this.KhachHang.findByEmail(newEmail);
    if (existing) {
      throw new ConflictException();
    }

    const updated = await this.KhachHang.updateEmail(email, newEmail);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
  }

  async countAll(): Promise<number> {
    return await this.KhachHang.countAll();
  }

  async countByMonth(year = new Date().getFullYear()): Promise<number[]> {
    return await this.KhachHang.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
