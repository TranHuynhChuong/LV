import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
} from '@nestjs/common';
import { SanPhamService } from './sanPham.service';
import { CreateDto, UpdateDto } from './sanPham.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('api/products')
export class SanPhamController {
  constructor(private readonly service: SanPhamService) {}

  // Tạo sản phẩm
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateDto
  ) {
    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const productImages = files.filter(
      (f) => f.fieldname === 'productImageFiles'
    );

    return this.service.create(body, coverImage, productImages);
  }

  // Cập nhật sản phẩm
  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateDto
  ) {
    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const productImages = files.filter(
      (f) => f.fieldname === 'productImageFiles'
    );
    return this.service.update(id, body, coverImage, productImages);
  }

  // Tìm sản phẩm theo tên (text search)
  @Get('search')
  findByName(
    @Query('keyword') keyword: string,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ) {
    return this.service.findByName(keyword, limit, page);
  }

  // Tìm sản phẩm tương tự (vector search)
  @Get('similar')
  findByVector(
    @Query('query') query: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
  ) {
    return this.service.findByVector(query, limit);
  }

  // Danh sách sản phẩm có phân trang và lọc trạng thái
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('filterType', new DefaultValuePipe(12), ParseIntPipe)
    filterType: 1 | 2 | 12
  ) {
    return this.service.findAll(page, limit, filterType);
  }

  // Chi tiết sản phẩm
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  // 🗑 Xóa sản phẩm (ẩn - soft delete)
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  // Đếm tổng số sản phẩm
  @Get('/count/total')
  countAll() {
    return this.service.countAll();
  }
}
