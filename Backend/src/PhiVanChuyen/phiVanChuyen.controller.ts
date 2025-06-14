import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PhiVanChuyenService } from './phiVanChuyen.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';
import { PhiVanChuyen } from './phiVanChuyen.schema';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';

@UseGuards(XacThucGuard)
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

  @Get('/count')
  async count(): Promise<any> {
    return await this.PhiVanChuyen.countAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyen.getShippingFeeById(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDto) {
    await this.PhiVanChuyen.updateShippingFee(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.PhiVanChuyen.deleteShippingFee(id);
  }
}
