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

@Controller('api/promotions')
export class KhuyenMaiController {
  constructor(private readonly khuyenMaiService: KhuyenMaiService) {}

  // ======= [POST] /khuyen-mai - Tạo mới khuyến mãi =======
  @UseGuards(XacThucGuard)
  @Post()
  create(@Body() data: CreateDto) {
    return this.khuyenMaiService.createKhuyenMai(data);
  }

  // ======= [GET] /khuyen-mai - Lấy danh sách khuyến mãi (phân trang, status) =======
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType?: string
  ) {
    return this.khuyenMaiService.getAllKhuyenMai({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: parsePositiveInt(filterType),
    });
  }

  // ======= [GET] /khuyen-mai - Lấy số lượng khuyến mãi hợp lệ =======

  @Get('/count')
  async count(): Promise<any> {
    return await this.khuyenMaiService.countValid();
  }

  // ======= [GET] /khuyen-mai/:id - Lấy chi tiết khuyến mãi theo ID =======
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType?: string
  ): Promise<ReturnType<typeof this.khuyenMaiService.getKhuyenMaiById>> {
    return this.khuyenMaiService.getKhuyenMaiById(
      id,
      parsePositiveInt(filterType)
    );
  }

  // ======= [PUT] /khuyen-mai/:id - Cập nhật khuyến mãi =======
  @UseGuards(XacThucGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDto) {
    return this.khuyenMaiService.updateKhuyenMai(id, data);
  }
}
