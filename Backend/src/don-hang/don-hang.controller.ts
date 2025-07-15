import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Patch,
  ParseIntPipe,
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
    @Query('dateStart') dateStartRaw: string,
    @Query('dateEnd') dateEndRaw: string
  ) {
    const dateStart = dateStartRaw ? new Date(dateStartRaw) : undefined;
    const dateEnd = dateEndRaw ? new Date(dateEndRaw) : undefined;

    return this.DonHangService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 24,
      filterType: filterType,
      dateStart: dateStart,
      dateEnd: dateEnd,
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
  async count(): Promise<any> {
    return await this.DonHangService.countAll();
  }

  @Get('/find/:id')
  async search(@Param('id') id: string): Promise<any> {
    return this.DonHangService.searchOrder(id.toUpperCase());
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType: OrderStatus
  ): Promise<any> {
    return this.DonHangService.findById(id.toUpperCase(), filterType);
  }

  // ============== Thống kê ===================//

  // Thống kê theo năm
  @Get('/stats/year/:year')
  getStatsByYear(@Param('year', ParseIntPipe) year: number) {
    return this.DonHangService.getStatsByYear(year);
  }

  // Thống kê theo tháng
  @Get('/stats/month/:year/:month')
  getStatsByMonth(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number
  ) {
    return this.DonHangService.getStatsByMonth(year, month);
  }

  @Get('/stats/export/month/:year/:month')
  async exportByMonth(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Res() res: Response
  ) {
    const { buffer, fileName } =
      await this.DonHangService.getExcelReportStatsByMonth(year, month);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('/stats/export/year/:year')
  async exportByYear(
    @Param('year', ParseIntPipe) year: number,
    @Res() res: Response
  ) {
    const { buffer, fileName } =
      await this.DonHangService.getExcelReportStatsByYear(year);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
