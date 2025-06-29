import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { UpdateDanhGiaDto } from './dto/update-danh-gia.dto';

@Controller('/api/reviews')
export class DanhGiaController {
  constructor(private readonly DanhGiaService: DanhGiaService) {}

  @Post()
  create(@Body() dto: CreateDanhGiaDto[]) {
    return this.DanhGiaService.create(dto);
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.DanhGiaService.findById(id);
  }

  @Get('/product/:productId')
  getAllOfProduct(
    @Param('productId') spId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '24'
  ) {
    return this.DanhGiaService.findAllOfProduct(
      +spId,
      parseInt(page),
      parseInt(limit)
    );
  }

  async getAll(
    @Query('page') page: number,
    @Query('limit') limit?: number,
    @Query('rating') rating?: number,
    @Query('date') date?: string
  ) {
    return this.DanhGiaService.findAll(
      page,
      limit,
      rating,
      date ? new Date(date) : undefined
    );
  }

  @Patch('/:id/hide')
  hide(@Param('id') id: string, @Body() dto: UpdateDanhGiaDto) {
    return this.DanhGiaService.hide(id, dto);
  }

  @Patch('/:id/show')
  show(@Param('id') id: string, @Body() dto: UpdateDanhGiaDto) {
    return this.DanhGiaService.show(id, dto);
  }

  @Get('stats/month/:year/:month')
  async countRatingOfMonth(
    @Param('year') year: number,
    @Param('month') month: number
  ) {
    return this.DanhGiaService.countRatingOfMonth(year, month);
  }

  @Get('stats/year/:year')
  async countRatingOfYear(@Param('year') year: number) {
    return this.DanhGiaService.countRatingOfYear(year);
  }
}
