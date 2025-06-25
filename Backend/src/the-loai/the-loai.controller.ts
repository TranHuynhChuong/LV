import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TheLoaiService } from './the-loai.service';

import { TheLoai } from './schemas/the-loai.schema';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { CreateTheLoaiDto } from './dto/create-the-loai.dto';
import { UpdateTheLoaiDto } from './dto/update-th-loai.dto';

@Controller('api/categories')
export class TheLoaiController {
  constructor(private readonly TheLoaiService: TheLoaiService) {}

  @UseGuards(XacThucGuard)
  @Post()
  async create(@Body() data: CreateTheLoaiDto) {
    return await this.TheLoaiService.create(data);
  }

  @Get()
  async findAll(): Promise<Partial<TheLoai>[]> {
    return await this.TheLoaiService.findAll();
  }

  @Get('/total')
  async count(): Promise<any> {
    return await this.TheLoaiService.countAll();
  }

  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.TheLoaiService.findById(id);
  }

  @UseGuards(XacThucGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTheLoaiDto
  ) {
    return await this.TheLoaiService.update(id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return await this.TheLoaiService.delete(id, staffId);
  }
}
