import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TTNhanHangKHService } from './tt-nhan-hang.service';
import { TTNhanHangKH } from './schemas/tt-nhan-hang-kh.schema';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { CreateTTNhanHangDto } from './dto/create-tt-nhan-hang.dto';
import { UpdateTTNhanHangDto } from './dto/update-tt-nhan-hang.dto';

@UseGuards(XacThucGuard)
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
  async create(@Body() data: CreateTTNhanHangDto): Promise<TTNhanHangKH> {
    return this.service.create(data);
  }

  /**
   * Lấy thông tin một địa chỉ nhận hàng cụ thể của khách hàng.
   *
   * @param id - ID địa chỉ nhận hàng.
   * @param customerId - ID khách hàng.
   * @returns Thông tin địa chỉ nhận hàng.
   */
  @Get(':customerId/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('customerId', ParseIntPipe) customerId: number
  ) {
    return this.service.findOne(id, customerId);
  }

  /**
   * Lấy tất cả địa chỉ nhận hàng của một khách hàng.
   *
   * @param customerId - ID khách hàng.
   * @returns Danh sách địa chỉ nhận hàng.
   */
  @Get('/:customerId')
  async findAll(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.service.findAll(customerId);
  }

  /**
   * Cập nhật thông tin địa chỉ nhận hàng của khách hàng.
   *
   * @param id - ID địa chỉ nhận hàng.
   * @param customerId - ID khách hàng.
   * @param data - Dữ liệu cập nhật.
   * @returns Thông tin địa chỉ sau khi cập nhật.
   */

  @Put(':customerId/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() data: UpdateTTNhanHangDto
  ): Promise<TTNhanHangKH> {
    return this.service.update(id, customerId, data);
  }

  /**
   * Xóa một địa chỉ nhận hàng của khách hàng.
   *
   * @param id - ID địa chỉ nhận hàng.
   * @param customerId - ID khách hàng.
   * @returns Kết quả xóa.
   */
  @Delete(':customerId/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Param('customerId', ParseIntPipe) customerId: number
  ) {
    return this.service.delete(id, customerId);
  }
}
