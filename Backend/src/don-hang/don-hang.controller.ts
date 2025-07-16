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
  async count(
    @Query('dateStart') dateStartRaw: string,
    @Query('dateEnd') dateEndRaw: string
  ): Promise<any> {
    const dateStart = dateStartRaw ? new Date(dateStartRaw) : undefined;
    const dateEnd = dateEndRaw ? new Date(dateEndRaw) : undefined;
    return await this.DonHangService.countAll(dateStart, dateEnd);
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
  getStatsByYear(
    @Query('dateStart') dateStartRaw: string,
    @Query('dateEnd') dateEndRaw: string
  ) {
    const dateStart = new Date(dateStartRaw);
    const dateEnd = new Date(dateEndRaw);
    return this.DonHangService.getStatsByDateRange(dateStart, dateEnd);
  }

  @Get('/stats/export')
  async exportStats(
    @Query('dateStart') dateStartRaw: string,
    @Query('dateEnd') dateEndRaw: string,
    @Query('staffId') staffId: string,
    @Res() res: Response
  ) {
    const dateStart = new Date(dateStartRaw);
    const dateEnd = new Date(dateEndRaw);

    const { buffer, fileName } =
      await this.DonHangService.getExcelReportStatsByDateRange(
        dateStart,
        dateEnd,
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
