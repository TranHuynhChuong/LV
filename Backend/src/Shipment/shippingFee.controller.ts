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
    return this.shippingFeeService.loadAddressFiles();
  }

  @Post()
  async create(@Body() dto: ShippingFeeDto) {
    return this.shippingFeeService.createShippingFee(dto);
  }

  @Get()
  async findAll() {
    const total = await this.shippingFeeService.countShippingFee();
    const shippingFees = await this.shippingFeeService.getAllShippingFee();
    return { total, shippingFees };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.shippingFeeService.getShippingFeeById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ShippingFeeDto) {
    return this.shippingFeeService.updateShippingFee(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.shippingFeeService.deleteShippingFee(id);
  }
}
