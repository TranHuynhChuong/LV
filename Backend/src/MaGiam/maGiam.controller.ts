import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MaGiamService } from './maGiam.service';
import { CreateDto, UpdateDto } from './maGiam.dto';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import { VoucherFilterType, VoucherType } from './maGiam.repository';

@Controller('api/vouchers')
export class MaGiamController {
  constructor(private readonly MaGiamService: MaGiamService) {}

  // ======= [POST] /ma-giam - Tạo mới mã giảm =======
  @UseGuards(XacThucGuard)
  @Post()
  create(@Body() data: CreateDto) {
    return this.MaGiamService.create(data);
  }

  // ======= [GET] /ma-giam - Lấy danh sách mã giảm (phân trang, status) =======
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType?: VoucherFilterType,
    @Query('type') type?: VoucherType
  ) {
    return this.MaGiamService.getAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: filterType,
      type: type,
    });
  }

  @Get('/allValid')
  findAllvalid() {
    return this.MaGiamService.getAllValid();
  }

  // ======= [GET] /ma-giam - Lấy số lượng mã giảm hợp lệ =======

  @Get('/total')
  async count(): Promise<any> {
    return await this.MaGiamService.countValid();
  }

  // ======= [GET] /ma-giam/:id - Lấy chi tiết mã giảm theo ID =======
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType?: VoucherFilterType,
    @Query('type') type?: VoucherType
  ): Promise<ReturnType<typeof this.MaGiamService.getById>> {
    return this.MaGiamService.getById(id, filterType, type);
  }

  // ======= [PUT] /ma-giam/:id - Cập nhật mã giảm =======
  @UseGuards(XacThucGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDto) {
    return this.MaGiamService.update(id, data);
  }
}
