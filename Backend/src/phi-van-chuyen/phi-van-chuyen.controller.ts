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
  Query,
} from '@nestjs/common';
import { PhiVanChuyenService } from './phi-van-chuyen.service';

import { PhiVanChuyen } from './schemas/phi-van-chuyen.schema';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { CreatePhiVanChuyenDto } from './dto/create-phi-van-chuyen.dto';
import { UpdatePhiVanChuyenDto } from './dto/update-phi-van-chuyen.dto';

@Controller('api/shipping')
export class PhiVanChuyenController {
  constructor(private readonly PhiVanChuyenService: PhiVanChuyenService) {}

  @Get('addressFiles')
  getAllShipmentJson() {
    return this.PhiVanChuyenService.loadAddressFiles();
  }
  @UseGuards(XacThucGuard)
  @Post()
  async create(@Body() data: CreatePhiVanChuyenDto) {
    return await this.PhiVanChuyenService.createShippingFee(data);
  }

  @Get()
  async findAllBasic(): Promise<Partial<PhiVanChuyen>[]> {
    return await this.PhiVanChuyenService.getAllShippingFee();
  }

  @Get('/total')
  async count(): Promise<any> {
    return await this.PhiVanChuyenService.countAll();
  }

  @Get('inf/:id')
  async getShippingFee(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyenService.getShippingFee(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyenService.getShippingFeeById(id);
  }

  @UseGuards(XacThucGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePhiVanChuyenDto
  ) {
    await this.PhiVanChuyenService.updateShippingFee(id, data);
  }
  @UseGuards(XacThucGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return await this.PhiVanChuyenService.deleteShippingFee(id, staffId);
  }
}
