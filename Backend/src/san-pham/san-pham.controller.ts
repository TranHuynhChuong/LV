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
  UseGuards,
} from '@nestjs/common';

import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import {
  ProductFilterType,
  ProductSortType,
} from './repositories/san-pham.repository';
import { SanPhamService } from './san-pham.service';
import { CreateSanPhamDto } from './dto/create-san-pham.dto';
import { UpdateSanPhamDto } from './dto/update-san-pham.dto';

@Controller('api/products')
export class SanPhamController {
  constructor(private readonly SanPhamService: SanPhamService) {}

  // Tạo sản phẩm
  @UseGuards(XacThucGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateSanPhamDto
  ) {
    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const productImages = files.filter(
      (f) => f.fieldname === 'productImageFiles'
    );

    return this.SanPhamService.create(body, coverImage, productImages);
  }

  // Cập nhật sản phẩm
  @UseGuards(XacThucGuard)
  @Put('/:id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateSanPhamDto
  ) {
    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const productImages = files.filter(
      (f) => f.fieldname === 'productImageFiles'
    );
    console.log(id, body, coverImage, productImages);
    return this.SanPhamService.update(id, body, coverImage, productImages);
  }

  // Tìm sản phẩm tương tự (vector search)
  @Post('/similar')
  findByVectorViaPost(@Body() body: { query: string; limit?: number }) {
    const limit = body.limit ?? 5;
    return this.SanPhamService.findByVector(body.query, limit);
  }

  // Đếm tổng số sản phẩm
  @Get('/total')
  countAll() {
    return this.SanPhamService.countAll();
  }

  @Get('/suggestions')
  getAutocomplete(@Query('keyword') keyword: string) {
    return this.SanPhamService.searchAutocomplete(keyword);
  }

  @Get('/search')
  search(
    @Query()
    query: {
      page?: string;
      sortType?: ProductSortType;
      filterType?: ProductFilterType;
      limit?: string;
      keyword?: string;
      categoryId?: string;
    }
  ) {
    const {
      page = '1',
      sortType,
      filterType,
      limit = '24',
      keyword,
      categoryId,
    } = query;
    const params = {
      page: parsePositiveInt(page),
      sortType: sortType,
      filterType: filterType,
      limit: parsePositiveInt(limit),
      keyword: keyword,
      categoryId: parsePositiveInt(categoryId),
    };
    return this.SanPhamService.search(params);
  }

  @Get()
  findAll(
    @Query()
    query: {
      page?: string;
      sortType?: ProductSortType;
      filterType?: ProductFilterType;
      limit?: string;
    }
  ) {
    const { page = '1', sortType, filterType, limit = '24' } = query;
    const params = {
      page: parsePositiveInt(page),
      sortType: sortType,
      filterType: filterType,
      limit: parsePositiveInt(limit),
    };
    return this.SanPhamService.findAll(params);
  }

  @Get('/isbn/:id')
  findByIsbn(
    @Param('id') id: string,
    @Query('filterType') filterType: ProductFilterType
  ) {
    return this.SanPhamService.findByIsbn(id, filterType);
  }

  // Chi tiết sản phẩm
  @Get('/:id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('filterType') filterType: ProductFilterType,
    @Query('mode') mode: 'default' | 'full'
  ) {
    return this.SanPhamService.findById(id, mode, filterType);
  }

  // Xóa sản phẩm (ẩn - soft delete)
  @Delete('/:id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return this.SanPhamService.delete(id, staffId);
  }
}
