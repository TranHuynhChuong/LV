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
import { Roles } from 'src/xac-thuc/xac-thuc.roles.decorator';

@Controller('api/categories')
export class TheLoaiController {
  constructor(private readonly TheLoaiService: TheLoaiService) {}

  /**
   * Tạo mới một thể loại sách.
   *
   * @param {CreateTheLoaiDto} data - Dữ liệu thể loại mới cần tạo.
   * @returns {Promise<TheLoai>} Thể loại mới được tạo.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Post()
  async create(@Body() data: CreateTheLoaiDto) {
    return await this.TheLoaiService.create(data);
  }

  /**
   * Lấy danh sách tất cả thể loại chưa bị xoá.
   *
   * @returns {Promise<Partial<TheLoai>[]>} Danh sách thể loại
   */
  @Get()
  async findAll(): Promise<Partial<TheLoai>[]> {
    return await this.TheLoaiService.findAll();
  }

  /**
   * Đếm tổng số thể loại chưa bị xoá.
   *
   * @returns {Promise<any>} Thông tin tổng thể loại (ví dụ tổng số)
   */
  @Get('/total')
  async count(): Promise<any> {
    return await this.TheLoaiService.countAll();
  }

  /**
   * Lấy thể loại theo ID.
   *
   * @param {number} id - ID thể loại
   * @returns {Promise<any>} Thể loại tương ứng hoặc null nếu không tìm thấy
   */
  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.TheLoaiService.findById(id);
  }

  /**
   * Cập nhật thông tin thể loại theo ID.
   *
   * @param {number} id - ID thể loại
   * @param {UpdateTheLoaiDto} data - Dữ liệu cập nhật
   * @returns Kết quả cập nhật
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTheLoaiDto
  ) {
    return await this.TheLoaiService.update(id, data);
  }

  /**
   * Xoá (đánh dấu xoá) thể loại theo ID.
   *
   * @param {number} id - ID thể loại
   * @param {string} staffId - ID nhân viên thực hiện xoá
   * @returns Kết quả xoá
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return await this.TheLoaiService.delete(id, staffId);
  }
}
