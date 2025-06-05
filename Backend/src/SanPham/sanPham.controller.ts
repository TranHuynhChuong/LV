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
  UseGuards,
} from '@nestjs/common';
import { SanPhamService } from './sanPham.service';
import { CreateDto, UpdateDto } from './sanPham.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { XacThucGuard } from 'src/XacThuc/xacThuc.guard';

@UseGuards(XacThucGuard)
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
    console.log(id, body, coverImage, productImages);
    return this.service.update(id, body, coverImage, productImages);
  }

  // Tìm sản phẩm theo keyword
  @Get('search')
  findByKeyword(
    @Query()
    query: {
      keyword: string;
      mode?: 'head' | 'tail' | 'cursor';
      cursorId?: string;
      currentPage?: string;
      targetPage?: string;
      sortType?: string;
      filterType?: string;
      limit?: string;
    }
  ) {
    const {
      keyword,
      mode = 'head',
      cursorId = '',
      currentPage = '1',
      targetPage = '1',
      sortType = '1',
      filterType,
      limit = '24',
    } = query;

    const searchParams = {
      keyword,
      mode,
      cursorId,
      currentPage: Number(currentPage),
      targetPage: Number(targetPage),
      sortType: Number(sortType) as 1 | 2 | 3,
      filterType: Number(filterType) as 1 | 2 | undefined,
      limit: Number(limit),
    };

    return this.service.findAll(searchParams);
  }

  // Tìm sản phẩm theo thể loại (categoryId - mã thể loại)
  @Get('category')
  findByCategory(
    @Query()
    query: {
      categoryId: number;
      mode?: 'head' | 'tail' | 'cursor';
      cursorId?: string;
      currentPage?: string;
      targetPage?: string;
      sortType?: string;
      filterType?: string;
      limit?: string;
    }
  ) {
    const {
      categoryId,
      mode = 'head',
      cursorId = '',
      currentPage = '1',
      targetPage = '1',
      sortType = '1',
      filterType,
      limit = '24',
    } = query;

    const searchParams = {
      mode,
      cursorId,
      currentPage: Number(currentPage),
      targetPage: Number(targetPage),
      sortType: Number(sortType) as 1 | 2 | 3,
      filterType: Number(filterType) as 1 | 2 | undefined,
      limit: Number(limit),
      categoryId,
    };

    return this.service.findAll(searchParams);
  }

  // Tìm sản phẩm tương tự (vector search)
  @Get('similar')
  findByVector(
    @Query('query') query: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
  ) {
    return this.service.findByVector(query, limit);
  }

  // Đếm tổng số sản phẩm
  @Get('/total')
  countAll() {
    return this.service.countAll();
  }

  // Danh sách sản phẩm có phân trang và lọc trạng thái
  @Get()
  findAll(
    @Query()
    query: {
      mode?: 'head' | 'tail' | 'cursor';
      cursorId?: string;
      currentPage?: string;
      targetPage?: string;
      sortType?: string;
      filterType?: string;
      limit?: string;
    }
  ) {
    const {
      mode = 'head',
      cursorId = '',
      currentPage = '1',
      targetPage = '1',
      sortType = '1',
      filterType,
      limit = '24',
    } = query;
    const searchParams = {
      mode,
      cursorId,
      currentPage: Number(currentPage),
      targetPage: Number(targetPage),
      sortType: Number(sortType) as 1 | 2 | 3,
      filterType: Number(filterType) as 1 | 2 | undefined,
      limit: Number(limit),
    };

    return this.service.findAll(searchParams);
  }

  // Chi tiết sản phẩm
  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('mode') mode: 'default' | 'full' = 'default'
  ) {
    return this.service.findById(id, mode);
  }

  // Xóa sản phẩm (ẩn - soft delete)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
