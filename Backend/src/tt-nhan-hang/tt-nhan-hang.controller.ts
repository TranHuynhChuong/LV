import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TTNhanHangKHService } from './tt-nhan-hang.service';
import { TTNhanHangKH } from './schemas/tt-nhan-hang-kh.schema';

@Controller('api/addresses')
export class TTNhanHangController {
  constructor(private readonly service: TTNhanHangKHService) {}

  /**
   * Tạo mới địa chỉ nhận hàng cho khách hàng.
   *
   * @param data - Dữ liệu địa chỉ nhận hàng.
   * @returns Địa chỉ nhận hàng mới được tạo.
   */
  @Post()
  async create(@Body() data: any): Promise<TTNhanHangKH> {
    return this.service.create(data);
  }

  /**
   * Lấy thông tin một địa chỉ nhận hàng cụ thể của khách hàng.
   *
   * @param NH_id - ID địa chỉ nhận hàng.
   * @param KH_id - ID khách hàng.
   * @returns Thông tin địa chỉ nhận hàng.
   */
  @Get(':KH_id/:NH_id')
  async findOne(
    @Param('NH_id', ParseIntPipe) NH_id: number,
    @Param('KH_id', ParseIntPipe) KH_id: number
  ): Promise<TTNhanHangKH> {
    return this.service.findOne(NH_id, KH_id);
  }

  /**
   * Lấy tất cả địa chỉ nhận hàng của một khách hàng.
   *
   * @param KH_id - ID khách hàng.
   * @returns Danh sách địa chỉ nhận hàng.
   */
  @Get('/:KH_id')
  async findAll(
    @Param('KH_id', ParseIntPipe) KH_id: number
  ): Promise<TTNhanHangKH[]> {
    return this.service.findAll(KH_id);
  }

  /**
   * Cập nhật thông tin địa chỉ nhận hàng của khách hàng.
   *
   * @param NH_id - ID địa chỉ nhận hàng.
   * @param KH_id - ID khách hàng.
   * @param data - Dữ liệu cập nhật.
   * @returns Thông tin địa chỉ sau khi cập nhật.
   */
  @Put(':KH_id/:NH_id')
  async update(
    @Param('NH_id', ParseIntPipe) NH_id: number,
    @Param('KH_id', ParseIntPipe) KH_id: number,
    @Body() data: Partial<TTNhanHangKH>
  ): Promise<TTNhanHangKH> {
    return this.service.update(NH_id, KH_id, data);
  }

  /**
   * Xóa một địa chỉ nhận hàng của khách hàng.
   *
   * @param NH_id - ID địa chỉ nhận hàng.
   * @param KH_id - ID khách hàng.
   * @returns Kết quả xóa.
   */
  @Delete(':KH_id/:NH_id')
  async delete(
    @Param('NH_id', ParseIntPipe) NH_id: number,
    @Param('KH_id', ParseIntPipe) KH_id: number
  ) {
    return this.service.delete(NH_id, KH_id);
  }
}
