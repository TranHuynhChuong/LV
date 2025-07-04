import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CustomerListResults,
  KhachHangRepository,
} from './repositories/khach-hang.repository';

import { KhachHang } from './schemas/khach-hang.schema';

@Injectable()
export class KhachHangUtilService {
  constructor(private readonly KhachHangRepo: KhachHangRepository) {}

  async getEmail(id: number) {
    const result = await this.KhachHangRepo.findById(id);
    if (!result) {
      throw new BadRequestException();
    }
    return result.KH_email;
  }
}

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CreateKhachHangDto } from './dto/create-khach-hang.dto';
import { UpdateKhachHangDto } from './dto/update-khach-hang.dto';

@Injectable()
export class KhachHangService {
  constructor(
    private readonly KhachHangRepo: KhachHangRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async create(data: CreateKhachHangDto): Promise<KhachHang> {
    const session = await this.connection.startSession();

    try {
      let result: KhachHang;
      await session.withTransaction(async () => {
        const existing = await this.KhachHangRepo.findByEmail(data.KH_email);
        if (existing) {
          throw new ConflictException('Tạo khách hàng - Email đã tồn tại');
        }

        const lastId = await this.KhachHangRepo.findLastId(session);
        const newId = lastId + 1;

        const created = await this.KhachHangRepo.create({
          ...data,
          KH_id: newId,
        });
        if (!created) {
          throw new BadRequestException(
            'Tạo khách hàng - Tạo khách hàng thất bại'
          );
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

    return this.KhachHangRepo.findAll(page, limit);
  }

  async update(id: number, data: UpdateKhachHangDto): Promise<KhachHang> {
    const updated = await this.KhachHangRepo.update(id, data);
    if (!updated) {
      throw new BadRequestException('Cập nhật khách hàng - Cập nhật thất bại');
    }
    return updated;
  }

  async updateEmail(id: number, newEmail: string): Promise<KhachHang> {
    const existing = await this.KhachHangRepo.findById(id);
    if (existing) {
      throw new ConflictException(
        'Cập nhật email khách hàng - Khách hàng không tồn tại'
      );
    }

    const updated = await this.KhachHangRepo.updateEmail(id, newEmail);
    if (!updated) {
      throw new BadRequestException(
        'Cập nhật email khách hàng - Không thể cập nhật email'
      );
    }
    return updated;
  }

  async countAll(): Promise<number> {
    return await this.KhachHangRepo.countAll();
  }

  async findByEmail(email: string): Promise<KhachHang | null> {
    return this.KhachHangRepo.findByEmail(email);
  }

  async findById(id: number): Promise<KhachHang> {
    const result = await this.KhachHangRepo.findById(id);
    if (!result) {
      throw new NotFoundException(
        'Tìm khách hàng - Không thể tìm thấy khách hàng'
      );
    }
    return result;
  }

  async countByMonth(year = new Date().getFullYear()): Promise<number[]> {
    return await this.KhachHangRepo.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
