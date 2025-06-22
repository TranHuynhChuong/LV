import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { DonHangService } from './donHang.service';
import { CheckDto, CreateDto } from './donHang.dto';
import { parsePositiveInt } from 'src/Util/convert';

@Controller('api/orders')
export class DonHangController {
  constructor(private readonly DonHangService: DonHangService) {}

  // ======= [POST] /don-hang - Tạo mới đơn hàng =======
  @Post()
  create(@Body() data: CreateDto) {
    return this.DonHangService.create(data);
  }

  @Post('/check')
  check(@Body() data: CheckDto) {
    return this.DonHangService.checkValid(data);
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: number,
    @Query('staffId') staffId: string
  ) {
    return this.DonHangService.update(id, status, staffId);
  }

  @Get()
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 24,
    @Query('filterType') filterType: number = 0
  ) {
    return this.DonHangService.getAll(page, limit, filterType);
  }

  @Get('/user/:userId')
  async getAllUser(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: string,
    @Param('userId') userId: number
  ) {
    return this.DonHangService.getAll(
      parsePositiveInt(page) ?? 1,
      parsePositiveInt(limit) ?? 24,
      parsePositiveInt(filterType) ?? 0,
      userId
    );
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<any> {
    return this.DonHangService.getDetail(id);
  }
}
