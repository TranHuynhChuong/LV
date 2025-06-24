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
import { OrderFilterType } from './repositories/donHang.repository';
import { OrderStatus } from './schemas/donHang.schema';

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
    @Query('staffId') staffId: string
  ) {
    return this.DonHangService.update(id, status, staffId);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: OrderFilterType
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
    @Query('filterType') filterType: OrderFilterType,
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
    @Query('filterType') filterType: OrderFilterType
  ): Promise<any> {
    return this.DonHangService.findById(id, filterType);
  }
}
