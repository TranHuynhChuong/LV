import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { KhuyenMaiService } from './khuyen-mai.service';
import { CreateKhuyenMaiDto } from './dto/create-khuyen-mai.dto';
import { UpdateKhuyenMaiDto } from './dto/update-khuyen-mai.dto';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import { PromotionFilterType } from './repositories/khuyen-mai.repository';

@Controller('api/promotions')
export class KhuyenMaiController {
  constructor(private readonly KhuyenMaiService: KhuyenMaiService) {}

  @UseGuards(XacThucGuard)
  @Post()
  create(@Body() data: CreateKhuyenMaiDto) {
    return this.KhuyenMaiService.createKhuyenMai(data);
  }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType?: PromotionFilterType
  ) {
    return this.KhuyenMaiService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: filterType,
    });
  }

  @Get('/total')
  async count(): Promise<any> {
    return await this.KhuyenMaiService.countValid();
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('filterType') filterType?: PromotionFilterType
  ): Promise<ReturnType<typeof this.KhuyenMaiService.findById>> {
    return this.KhuyenMaiService.findById(id, filterType);
  }

  @UseGuards(XacThucGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKhuyenMaiDto
  ) {
    return this.KhuyenMaiService.update(id, data);
  }

  @UseGuards(XacThucGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.KhuyenMaiService.delete(id);
  }
}
