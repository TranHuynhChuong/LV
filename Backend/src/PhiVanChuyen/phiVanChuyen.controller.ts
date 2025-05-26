import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { PhiVanChuyenService } from './phiVanChuyen.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';
import { PhiVanChuyen } from './phiVanChuyen.schema';

@Controller('api/shipping')
export class PhiVanChuyenController {
  constructor(private readonly PhiVanChuyen: PhiVanChuyenService) {}

  @Get('addressFiles')
  getAllShipmentJson() {
    return this.PhiVanChuyen.loadAddressFiles();
  }

  @Post()
  async create(@Body() data: CreateDto) {
    return await this.PhiVanChuyen.createShippingFee(data);
  }

  @Get()
  async findAllBasic(): Promise<Partial<PhiVanChuyen>[]> {
    return await this.PhiVanChuyen.getAllShippingFee();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<any> {
    return await this.PhiVanChuyen.getShippingFeeById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateDto) {
    await this.PhiVanChuyen.updateShippingFee(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.PhiVanChuyen.deleteShippingFee(id);
  }
}
