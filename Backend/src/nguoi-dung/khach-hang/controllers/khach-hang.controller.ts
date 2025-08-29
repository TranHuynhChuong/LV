import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { parsePositiveInt } from 'src/Util/convert';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { Roles } from 'src/xac-thuc/xac-thuc.roles.decorator';
import { UpdateKhachHangDto } from '../dto/update-khach-hang.dto';
import { KhachHangService } from '../services/khach-hang.service';

@UseGuards(XacThucGuard)
@Controller('api/users/customers')
export class KhachHangController {
  constructor(private readonly KhachHangService: KhachHangService) {}

  /**
   * Lấy danh sách khách hàng phân trang.
   *
   * @param query.page Trang cần lấy (mặc định: 1).
   * @param query.limit Số lượng mỗi trang (mặc định: 24).
   * @returns Danh sách khách hàng theo phân trang.
   */
  @Roles(1)
  @Get()
  findAll(
    @Query()
    query: {
      page?: number;
      limit?: string;
    }
  ) {
    const { page = '1', limit = '24' } = query;
    const params = {
      page: parsePositiveInt(page),
      limit: parsePositiveInt(limit),
    };
    return this.KhachHangService.findAll(params);
  }

  /**
   * Lấy thông tin khách hàng theo địa chỉ email.
   *
   * @param email Địa chỉ email cần tìm.
   * @returns Thông tin khách hàng.
   */
  @Get('/inf/:id')
  async getCustomerById(@Param('id', ParseIntPipe) id: number) {
    return await this.KhachHangService.findById(id);
  }

  /**
   * Lấy thông tin khách hàng theo địa chỉ email.
   *
   * @param email Địa chỉ email cần tìm.
   * @returns Thông tin khách hàng.
   */
  @Get('/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    return await this.KhachHangService.findByEmail(email);
  }

  /**
   * Cập nhật thông tin khách hàng theo ID.
   *
   * @param id ID của khách hàng.
   * @param data Dữ liệu cập nhật.
   * @returns Thông tin sau khi cập nhật.
   */
  @Put('/:id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKhachHangDto
  ) {
    return await this.KhachHangService.update(id, data);
  }
}
