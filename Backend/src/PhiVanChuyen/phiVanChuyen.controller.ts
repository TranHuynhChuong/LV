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
import { PhiVanChuyenService } from './phiVanChuyen.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';
import { PhiVanChuyen } from './phiVanChuyen.schema';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';

@Controller('api/shipping')
export class PhiVanChuyenController {
  constructor(private readonly PhiVanChuyen: PhiVanChuyenService) {}

  @Get('addressFiles')
  getAllShipmentJson() {
    return this.PhiVanChuyen.loadAddressFiles();
  }
  @UseGuards(XacThucGuard)
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

  @Get('inf/:id')
  async getShippingFee(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyen.getShippingFee(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyen.getShippingFeeById(id);
  }

  @UseGuards(XacThucGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDto) {
    await this.PhiVanChuyen.updateShippingFee(id, data);
  }
  @UseGuards(XacThucGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return await this.PhiVanChuyen.deleteShippingFee(id, staffId);
  }
}
