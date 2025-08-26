import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { KhachHangRepository } from './repositories/khach-hang.repository';

import { KhachHang } from './schemas/khach-hang.schema';

@Injectable()
export class KhachHangUtilService {
  constructor(private readonly KhachHangRepo: KhachHangRepository) {}

  /**
   * Lấy email của khách hàng theo ID.
   *
   * @param id Mã định danh khách hàng.
   * @returns Địa chỉ email của khách hàng.
   * @throws BadRequestException Nếu không tìm thấy khách hàng.
   */
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
import { getNextSequence } from 'src/Util/counter.service';
import { KhachHangResponseDto } from './dto/response-khach-hang.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class KhachHangService {
  constructor(
    private readonly KhachHangRepo: KhachHangRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới một khách hàng.
   *
   * @param data Dữ liệu tạo khách hàng.
   * @returns Khách hàng mới được tạo.
   * @throws ConflictException Nếu email đã tồn tại.
   * @throws BadRequestException Nếu quá trình tạo thất bại.
   */
  async create(data: CreateKhachHangDto): Promise<KhachHang> {
    const session = await this.connection.startSession();
    try {
      let result: KhachHang;
      await session.withTransaction(async () => {
        const existing = await this.KhachHangRepo.findByEmail(data.KH_email);
        if (existing) {
          throw new ConflictException('Tạo khách hàng - Email đã tồn tại');
        }
        if (!this.connection.db) {
          throw new Error('Không thể kết nối cơ sở dữ liệu');
        }
        // Lấy giá trị seq tự tăng từ MongoDB
        const seq = await getNextSequence(
          this.connection.db,
          'customerId',
          session
        );
        const created = await this.KhachHangRepo.create({
          ...data,
          KH_id: seq,
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

  /**
   * Lấy danh sách khách hàng có phân trang.
   *
   * @param options Tuỳ chọn phân trang (mặc định: trang 1, 24 mục/trang).
   * @returns Danh sách khách hàng và tổng số lượng.
   */
  async findAll(options: { page?: number; limit?: number }) {
    const { page = 1, limit = 24 } = options;
    const results = await this.KhachHangRepo.findAll(page, limit);
    return {
      data: plainToInstance(KhachHangResponseDto, results.data),
      paginationInfo: results.paginationInfo,
    };
  }

  /**
   * Cập nhật thông tin khách hàng.
   *
   * @param id Mã định danh khách hàng.
   * @param data Dữ liệu cần cập nhật.
   * @returns Khách hàng sau khi được cập nhật.
   * @throws BadRequestException Nếu cập nhật thất bại.
   */
  async update(id: number, data: UpdateKhachHangDto): Promise<KhachHang> {
    const updated = await this.KhachHangRepo.update(id, data);
    if (!updated) {
      throw new BadRequestException('Cập nhật khách hàng - Cập nhật thất bại');
    }
    return updated;
  }

  /**
   * Cập nhật email của khách hàng.
   *
   * @param id Mã định danh khách hàng.
   * @param newEmail Địa chỉ email mới.
   * @returns Khách hàng sau khi cập nhật email.
   * @throws ConflictException Nếu khách hàng không tồn tại.
   * @throws BadRequestException Nếu cập nhật email thất bại.
   */
  async updateEmail(id: number, newEmail: string): Promise<KhachHang> {
    const existing = await this.KhachHangRepo.findById(id);
    if (!existing) {
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

  /**
   * Đếm tổng số khách hàng trong hệ thống.
   *
   * @returns Tổng số lượng khách hàng.
   */
  async countAll(): Promise<number> {
    return await this.KhachHangRepo.countAll();
  }

  /**
   * Tìm khách hàng theo địa chỉ email.
   *
   * @param email Địa chỉ email cần tìm.
   * @returns Thông tin khách hàng hoặc null nếu không tìm thấy.
   */
  async findByEmail(email: string) {
    const result = await this.KhachHangRepo.findByEmail(email);
    if (!result) return null;
    return plainToInstance(KhachHangResponseDto, result);
  }

  /**
   * Tìm khách hàng theo ID.
   *
   * @param id Mã định danh khách hàng.
   * @returns Khách hàng tương ứng với ID.
   * @throws NotFoundException Nếu không tìm thấy khách hàng.
   */
  async findById(id: number): Promise<KhachHang> {
    const result = await this.KhachHangRepo.findById(id);
    if (!result) {
      throw new NotFoundException(
        'Tìm khách hàng - Không thể tìm thấy khách hàng'
      );
    }
    return result;
  }

  /**
   * Thống kê số lượng khách hàng theo từng tháng trong một năm.
   *
   * @param year Năm cần thống kê (mặc định là năm hiện tại).
   * @returns Mảng 12 phần tử tương ứng số lượng khách hàng mỗi tháng.
   */
  async countByMonth(year = new Date().getFullYear()): Promise<number[]> {
    return await this.KhachHangRepo.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
