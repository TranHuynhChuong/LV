import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { MaGiamService } from './ma-giam.service';
import { CreateMaGiamDto } from './dto/create-ma-giam.dto';
import { UpdateMaGiamDto } from './dto/update-ma-giam.dto';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import {
  VoucherFilterType,
  VoucherType,
} from './repositories/ma-giam.repository';

@Controller('api/vouchers')
export class MaGiamController {
  constructor(private readonly MaGiamService: MaGiamService) {}

  // ======= [POST] /Tạo mới mã giảm =======
  @UseGuards(XacThucGuard)
  @Post()
  create(@Body() data: CreateMaGiamDto) {
    return this.MaGiamService.create(data);
  }

  // ======= [GET] /Lấy danh sách mã giảm (phân trang, status) =======
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

  // ======= [GET] /Lấy số lượng mã giảm hợp lệ =======

  @Get('/total')
  async count(): Promise<any> {
    return await this.MaGiamService.countValid();
  }

  // ======= [GET] Lấy chi tiết mã giảm theo ID =======
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType?: VoucherFilterType,
    @Query('type') type?: VoucherType
  ): Promise<ReturnType<typeof this.MaGiamService.getById>> {
    return this.MaGiamService.getById(id, filterType, type);
  }

  // ======= [PUT] Cập nhật mã giảm =======
  @UseGuards(XacThucGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateMaGiamDto) {
    return this.MaGiamService.update(id, data);
  }

  // ======= [DELETE] Xóa mã giảm =======
  @UseGuards(XacThucGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.MaGiamService.delete(id);
  }
}
