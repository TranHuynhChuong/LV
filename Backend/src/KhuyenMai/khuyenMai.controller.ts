import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { KhuyenMaiService } from './khuyenMai.service';
import { CreateDto, UpdateDto } from './khuyenMai.dto';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';

@UseGuards(XacThucGuard)
@Controller('api/promotions')
export class KhuyenMaiController {
  constructor(private readonly khuyenMaiService: KhuyenMaiService) {}

  // ======= [POST] /khuyen-mai - Tạo mới khuyến mãi =======
  @Post()
  create(@Body() data: CreateDto) {
    return this.khuyenMaiService.createKhuyenMai(data);
  }

  // ======= [GET] /khuyen-mai - Lấy danh sách khuyến mãi (phân trang, status) =======
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filterType') filterType?: '0' | '1'
  ) {
    return this.khuyenMaiService.getAllKhuyenMai({
      page: Number(page),
      limit: Number(limit),
      filterType:
        filterType !== undefined ? (Number(filterType) as 0 | 1) : undefined,
    });
  }

  // ======= [GET] /khuyen-mai/:id - Lấy chi tiết khuyến mãi theo ID =======
  @Get(':id')
  async findById(
    @Param('id') id: string
  ): Promise<ReturnType<typeof this.khuyenMaiService.getKhuyenMaiById>> {
    return this.khuyenMaiService.getKhuyenMaiById(id);
  }

  // ======= [PUT] /khuyen-mai/:id - Cập nhật khuyến mãi =======
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDto) {
    return this.khuyenMaiService.updateKhuyenMai(id, data);
  }

  // ======= [DELETE] /khuyen-mai/:id - Xóa mềm khuyến mãi =======
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.khuyenMaiService.deleteKhuyenMai(id);
  }
}
