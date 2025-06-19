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
    @Query('filterType') filterType?: string,
    @Query('type') type?: string
  ) {
    return this.MaGiamService.getAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: parsePositiveInt(filterType),
      type: parsePositiveInt(type),
    });
  }

  // ======= [GET] /ma-giam - Lấy số lượng mã giảm hợp lệ =======

  @Get('/count')
  async count(): Promise<any> {
    return await this.MaGiamService.countValid();
  }

  // ======= [GET] /ma-giam/:id - Lấy chi tiết mã giảm theo ID =======
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType?: string,
    @Query('type') type?: string
  ): Promise<ReturnType<typeof this.MaGiamService.getById>> {
    return this.MaGiamService.getById(
      id,
      parsePositiveInt(filterType),
      parsePositiveInt(type)
    );
  }

  // ======= [PUT] /ma-giam/:id - Cập nhật mã giảm =======
  @UseGuards(XacThucGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateDto,
    @Query('filterType') filterType?: string
  ) {
    return this.MaGiamService.update(id, data, parsePositiveInt(filterType));
  }
}
