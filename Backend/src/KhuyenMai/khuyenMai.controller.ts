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
import { KhuyenMaiService } from './khuyenMai.service';
import { CreateDto, UpdateDto } from './khuyenMai.dto';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import { PromotionFilterType } from './repositories/khuyenMai.repository';

@Controller('api/promotions')
export class KhuyenMaiController {
  constructor(private readonly KhuyenMaiService: KhuyenMaiService) {}

  // ======= [POST] /khuyen-mai - Tạo mới khuyến mãi =======
  @UseGuards(XacThucGuard)
  @Post()
  create(@Body() data: CreateDto) {
    return this.KhuyenMaiService.createKhuyenMai(data);
  }

  // ======= [GET] /khuyen-mai - Lấy danh sách khuyến mãi (phân trang, status) =======
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType?: PromotionFilterType
  ) {
    // Convert filterType to PromotionFilterType if defined
    return this.KhuyenMaiService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: filterType,
    });
  }

  // ======= [GET] /khuyen-mai - Lấy số lượng khuyến mãi hợp lệ =======

  @Get('/total')
  async count(): Promise<any> {
    return await this.KhuyenMaiService.countValid();
  }

  // ======= [GET] /khuyen-mai/:id - Lấy chi tiết khuyến mãi theo ID =======
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType?: PromotionFilterType
  ): Promise<ReturnType<typeof this.KhuyenMaiService.findById>> {
    return this.KhuyenMaiService.findById(id, filterType);
  }

  // ======= [PUT] /khuyen-mai/:id - Cập nhật khuyến mãi =======
  @UseGuards(XacThucGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDto) {
    return this.KhuyenMaiService.update(id, data);
  }
}
