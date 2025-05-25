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

@Controller('api/categories')
export class TheLoaiController {
  constructor(private readonly TheLoai: TheLoaiService) {}

  @Post()
  async create(@Body() data: CreateDto) {
    await this.TheLoai.create(data);
    return {
      message: 'Tạo thể loại thành công',
    };
  }

  @Get()
  async findAllBasic() {
    const data = await this.TheLoai.findAllBasic();
    return {
      data,
      message: 'Lấy danh sách thể loại thành công',
    };
  }

  @Get('all')
  async findAll() {
    const data = await this.TheLoai.findAll();
    return {
      data,
      message: 'Lấy danh sách thể loại thành công',
    };
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateDto) {
    await this.TheLoai.update(id, data);
    return {
      message: 'Cập nhật thể loại thành công',
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.TheLoai.delete(id);
    return {
      message: 'Xóa thể loại thành công',
    };
  }
}
