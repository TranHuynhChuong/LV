import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CustomerListResults,
  KhachHangRepository,
} from './khachHang.repository';
import { CreateDto, UpdateDto } from './khachHang.dto';
import { KhachHang } from './khachHang.schema';

@Injectable()
export class KhachHangUtilService {
  constructor(private readonly KhachHang: KhachHangRepository) {}
}

@Injectable()
export class KhachHangService {
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

  async findAll(options: {
    page?: number;
    limit?: number;
  }): Promise<CustomerListResults> {
    const { page = 1, limit = 24 } = options;

    return this.KhachHang.findAll(page, limit);
  }

  async update(email: string, data: UpdateDto): Promise<KhachHang> {
    const updated = await this.KhachHang.update(email, data);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
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

  async findByEmail(email: string): Promise<KhachHang> {
    const result = await this.KhachHang.findByEmail(email);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async countByMonth(year = new Date().getFullYear()): Promise<number[]> {
    return await this.KhachHang.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
