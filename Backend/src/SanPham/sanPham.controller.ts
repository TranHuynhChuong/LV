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
import { parsePositiveInt } from 'src/Util/convert';

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
  @Put('/:id')
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

  // Tìm sản phẩm tương tự (vector search)
  @Get('/similar')
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

  @Get('/search')
  search(
    @Query()
    query: {
      page?: number;
      sortType?: string;
      filterType?: string;
      limit?: string;
      keyword?: string;
      categoryId?: string;
    }
  ) {
    const {
      page = '1',
      sortType = '1',
      filterType,
      limit = '24',
      keyword,
      categoryId,
    } = query;
    const params = {
      page: parsePositiveInt(page),
      sortType: parsePositiveInt(sortType),
      filterType: parsePositiveInt(filterType),
      limit: parsePositiveInt(limit),
      keyword: keyword,
      categoryId: parsePositiveInt(categoryId),
    };

    console.log(params);

    return this.service.search(params);
  }

  @Get()
  findAll(
    @Query()
    query: {
      page?: number;
      sortType?: string;
      filterType?: string;
      limit?: string;
    }
  ) {
    const { page = '1', sortType = '1', filterType, limit = '24' } = query;
    const params = {
      page: parsePositiveInt(page),
      sortType: parsePositiveInt(sortType),
      filterType: parsePositiveInt(filterType),
      limit: parsePositiveInt(limit),
    };

    console.log(params);

    return this.service.findAll(params);
  }

  // Chi tiết sản phẩm
  @Get('/:id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('filterType') filterType: string,
    @Query('mode') mode: 'default' | 'full' | 'search'
  ) {
    return this.service.findById(id, mode, parsePositiveInt(filterType));
  }

  // Xóa sản phẩm (ẩn - soft delete)
  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
