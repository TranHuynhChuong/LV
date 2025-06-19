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
import { TheLoaiService } from './theLoai.service';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';

@Controller('api/categories')
export class TheLoaiController {
  constructor(private readonly TheLoai: TheLoaiService) {}

  @UseGuards(XacThucGuard)
  @Post()
  async create(@Body() data: CreateDto) {
    return await this.TheLoai.create(data);
  }

  @Get()
  async findAll(): Promise<Partial<TheLoai>[]> {
    return await this.TheLoai.findAll();
  }

  @Get('/count')
  async count(): Promise<any> {
    return await this.TheLoai.countAll();
  }

  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.TheLoai.findById(id);
  }

  @UseGuards(XacThucGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDto) {
    return await this.TheLoai.update(id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return await this.TheLoai.delete(id, staffId);
  }
}
