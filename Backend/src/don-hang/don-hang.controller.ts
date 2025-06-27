import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
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
    @Query('filterType') filterType: OrderStatus
  ) {
    return this.DonHangService.findAll(
      parsePositiveInt(page) ?? 1,
      parsePositiveInt(limit) ?? 24,
      filterType
    );
  }

  @Get('/user/:userId')
  async findAllUser(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: OrderStatus,
    @Param('userId') userId: number
  ) {
    return this.DonHangService.findAll(
      parsePositiveInt(page) ?? 1,
      parsePositiveInt(limit) ?? 24,
      filterType,
      userId
    );
  }

  @Get('/total')
  async count(): Promise<any> {
    return await this.DonHangService.countAll();
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType: OrderStatus
  ): Promise<any> {
    return this.DonHangService.findById(id, filterType);
  }

  // ============== Thống kê ===================//

  // Thống kê theo năm
  @Get('/stats/year/:year')
  getStatsByYear(@Param('year', ParseIntPipe) year: number) {
    return this.DonHangService.getStatsByYear(year);
  }

  // Thống kê theo quý
  @Get('/stats/quarter/:year/:quarter')
  getStatsByQuarter(
    @Param('year', ParseIntPipe) year: number,
    @Param('quarter', ParseIntPipe) quarter: 1 | 2 | 3 | 4
  ) {
    return this.DonHangService.getStatsByQuarter(year, quarter);
  }

  // Thống kê theo tháng
  @Get('/stats/month/:year/:month')
  getStatsByMonth(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number
  ) {
    return this.DonHangService.getStatsByMonth(year, month);
  }
}
