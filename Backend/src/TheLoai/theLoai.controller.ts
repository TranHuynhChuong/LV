import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TheLoaiService } from './theLoai.service';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';

@Controller('api/categories')
export class TheLoaiController {
  constructor(private readonly TheLoai: TheLoaiService) {}

  @Post()
  async create(@Body() data: CreateDto) {
    return await this.TheLoai.create(data);
  }

  @Get()
  async findAll(): Promise<Partial<TheLoai>[]> {
    return await this.TheLoai.findAll();
  }

  @Get('/:id')
  async findById(@Param('id') id: number): Promise<any> {
    return await this.TheLoai.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateDto) {
    return await this.TheLoai.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.TheLoai.delete(id);
  }
}
