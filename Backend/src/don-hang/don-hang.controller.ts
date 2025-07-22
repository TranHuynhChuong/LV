import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Patch,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { DonHangService } from './don-hang.service';
import { CheckDto, CreateDto } from './dto/create-don-hang.dto';
import { parsePositiveInt } from 'src/Util/convert';
import { OrderStatus } from './repositories/don-hang.repository';

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

  @Patch('/:status/:id')
  async updateStatusByPath(
    @Param('id') id: string,
    @Param('status') status: OrderStatus,
    @Body('staffId') staffId: string
  ) {
    return this.DonHangService.update(id, status, staffId);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;

    return this.DonHangService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 24,
      filterType: filterType,
      from: start,
      to: end,
    });
  }

  @Get('/user/:userId')
  async findAllUser(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: OrderStatus,
    @Param('userId') userId: number
  ) {
    return this.DonHangService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 24,
      filterType: filterType,
      userId: userId,
    });
  }

  @Get('/total')
  async count(
    @Query('from') from?: string,
    @Query('to') to?: string
  ): Promise<any> {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    return await this.DonHangService.countAll(start, end);
  }

  @Get('/find/:id')
  async search(@Param('id') id: string): Promise<any> {
    return this.DonHangService.searchOrder(id.toUpperCase());
  }

  @Get('/detail/:id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType: OrderStatus
  ): Promise<any> {
    return this.DonHangService.findById(id.toUpperCase(), filterType);
  }

  // Thống kê theo năm
  @Get('/stats')
  getStatsByYear(@Query('from') from: string, @Query('to') to: string) {
    const start = new Date(from);
    const end = new Date(to);
    return this.DonHangService.getStatsByDateRange(start, end);
  }

  @Get('/stats/export')
  async exportStats(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('staffId') staffId: string,
    @Res() res: Response
  ) {
    if (!from && !to) return;

    const start = new Date(from);
    const end = new Date(to);

    const { buffer, fileName } =
      await this.DonHangService.getExcelReportStatsByDateRange(
        start,
        end,
        staffId
      );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
