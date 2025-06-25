import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { UpdateDanhGiaDto } from './dto/update-danh-gia.dto';

@Controller('danh-gia')
export class DanhGiaController {
  constructor(private readonly danhGiaService: DanhGiaService) {}

  @Post()
  create(@Body() createDanhGiaDto: CreateDanhGiaDto) {
    return this.danhGiaService.create(createDanhGiaDto);
  }

  @Get()
  findAll() {
    return this.danhGiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.danhGiaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDanhGiaDto: UpdateDanhGiaDto) {
    return this.danhGiaService.update(+id, updateDanhGiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.danhGiaService.remove(+id);
  }
}
