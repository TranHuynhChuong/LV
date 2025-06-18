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

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class KhachHangService {
  constructor(
    private readonly KhachHang: KhachHangRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async create(data: CreateDto): Promise<KhachHang> {
    const session = await this.connection.startSession();

    try {
      let result: KhachHang;
      await session.withTransaction(async () => {
        const existing = await this.KhachHang.findByEmail(data.KH_email);
        if (existing) {
          throw new ConflictException();
        }

        const lastId = await this.KhachHang.findLastId(session);
        const newId = lastId + 1;

        const created = await this.KhachHang.create({ ...data, KH_id: newId });
        if (!created) {
          throw new BadRequestException();
        }
        result = created;
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
  }): Promise<CustomerListResults> {
    const { page = 1, limit = 24 } = options;

    return this.KhachHang.findAll(page, limit);
  }

  async update(id: string, data: UpdateDto): Promise<KhachHang> {
    const updated = await this.KhachHang.update(id, data);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
  }

  async updateEmail(id: string, newEmail: string): Promise<KhachHang> {
    const existing = await this.KhachHang.findByEmail(newEmail);
    if (existing) {
      throw new ConflictException();
    }

    const updated = await this.KhachHang.updateEmail(id, newEmail);
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

  async findByid(id: string): Promise<KhachHang> {
    const result = await this.KhachHang.findById(id);
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
