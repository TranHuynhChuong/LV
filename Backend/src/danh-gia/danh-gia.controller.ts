import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
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

  @Get('all')
  async getAllReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('rating') rating?: number,
    @Query('date') date?: string,
    @Query('status') status?: 'all' | 'visible' | 'hidden'
  ): Promise<unknown> {
    const parsedDate = date ? new Date(date) : undefined;

    return this.DanhGiaService.findAll(
      page,
      limit,
      rating ? +rating : undefined,
      parsedDate,
      status
    );
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

  @Get('/stats')
  async countRatingOfMonth(
    @Query('dateStart') dateStartRaw: string,
    @Query('dateEnd') dateEndRaw: string
  ) {
    const dateStart = new Date(dateStartRaw);
    const dateEnd = new Date(dateEndRaw);
    return this.DanhGiaService.countRating(dateStart, dateEnd);
  }

  @Patch('/hide')
  async hideReview(@Body() dto: UpdateDanhGiaDto) {
    return this.DanhGiaService.hide(dto);
  }

  @Patch('/show')
  async showReview(@Body() dto: UpdateDanhGiaDto) {
    return this.DanhGiaService.show(dto);
  }
}
