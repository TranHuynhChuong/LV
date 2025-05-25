import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { ShippingFeeService } from './shippingFee.service';
import { ShippingFeeDto } from './shippingFee.dto';

@Controller('api/shipping')
export class ShippingFeeController {
  constructor(private readonly shippingFeeService: ShippingFeeService) {}

  @Get('addressFiles')
  getAllShipmentJson() {
    const data = this.shippingFeeService.loadAddressFiles();
    return {
      data,
      message: 'Lấy danh sách địa chỉ thành công',
    };
  }

  @Post()
  async create(@Body() dto: ShippingFeeDto) {
    const data = await this.shippingFeeService.createShippingFee(dto);
    return {
      data,
      message: 'Tạo phí vận chuyển thành công',
    };
  }

  @Get()
  async findAll() {
    const total = await this.shippingFeeService.countShippingFee();
    const shippingFees = await this.shippingFeeService.getAllShippingFee();
    return {
      data: { total, shippingFees },
      message: 'Lấy danh sách phí vận chuyển thành công',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const data = await this.shippingFeeService.getShippingFeeById(id);
    return {
      data,
      message: 'Lấy phí vận chuyển thành công',
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ShippingFeeDto) {
    const data = await this.shippingFeeService.updateShippingFee(id, dto);
    return {
      data,
      message: 'Cập nhật phí vận chuyển thành công',
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.shippingFeeService.deleteShippingFee(id);
    return {
      data,
      message: 'Xóa phí vận chuyển thành công',
    };
  }
}
