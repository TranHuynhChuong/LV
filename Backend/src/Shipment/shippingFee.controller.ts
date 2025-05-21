import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  InternalServerErrorException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { ShippingFeeService } from './shippingFee.service';
import { ShippingFeeDto } from './shippingFee.dto';

@Controller('api/shipping')
export class ShippingFeeController {
  constructor(private readonly ShippingFeeService: ShippingFeeService) {}

  @Post()
  async create(@Body() dto: ShippingFeeDto) {
    try {
      const result = await this.ShippingFeeService.createShippingFeet(dto);
      if (!result) {
        throw new ConflictException('Khu vực đã được tạo phí vận chuyển');
      } else {
        return result;
      }
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi khi tạo phí vận chuyển');
    }
  }

  @Get('addressFiles')
  getAllShipmentJson() {
    try {
      return this.ShippingFeeService.loadAddressFiles();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  async findAll() {
    try {
      const total = await this.ShippingFeeService.countShippingFee();
      const shippingFees = await this.ShippingFeeService.getAllShippingFee();
      return { total: total, shippingFees: shippingFees };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Lỗi truy suất dữ liệu');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.ShippingFeeService.getShippingFeetById(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Lỗi truy suất dữ liệu');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ShippingFeeDto) {
    try {
      return await this.ShippingFeeService.updateShippingFeet(id, dto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Lỗi khi cập nhật dữ liệu');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.ShippingFeeService.deleteShippingFeet(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Lỗi khi xóa dữ liệu');
    }
  }
}
