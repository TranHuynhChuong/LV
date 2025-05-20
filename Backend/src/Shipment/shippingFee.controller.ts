import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { ShippingFeeService } from './shippingFee.service';
import { ShippingFeeDto } from './shippingFee.dto';

@Controller('api/Shipping')
export class ShippingFeeController {
  constructor(private readonly ShippingFeeService: ShippingFeeService) {}

  @Post()
  async create(@Body() dto: ShippingFeeDto) {
    try {
      return await this.ShippingFeeService.createShippingFeet(dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.ShippingFeeService.getShippingFeetById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ShippingFeeDto) {
    try {
      return await this.ShippingFeeService.updateShippingFeet(id, dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.ShippingFeeService.deleteShippingFeet(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
