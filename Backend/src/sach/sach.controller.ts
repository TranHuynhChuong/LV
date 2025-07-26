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
import { BookFilterType, BookSortType } from './repositories/sach.repository';
import { SachService } from './sach.service';
import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';

@Controller('api/books')
export class SachController {
  constructor(private readonly SachService: SachService) {}

  // Tạo sản phẩm
  @UseGuards(XacThucGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateSachDto
  ) {
    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const images = files.filter((f) => f.fieldname === 'imageFiles');

    return this.SachService.create(body, coverImage, images);
  }

  // Cập nhật sản phẩm
  @UseGuards(XacThucGuard)
  @Put('/:id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateSachDto
  ) {
    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const images = files.filter((f) => f.fieldname === 'ImageFiles');
    console.log(id, body, coverImage, images);
    return this.SachService.update(id, body, coverImage, images);
  }

  // Tìm sản phẩm tương tự (vector search)
  @Post('/find')
  findByVectorViaPost(@Body() body: { content: string; limit?: number }) {
    const { content, limit = 3 } = body;
    return this.SachService.findByVector(content, Math.min(limit, 10));
  }

  // Đếm tổng số sản phẩm
  @Get('/total')
  countAll() {
    return this.SachService.countAll();
  }

  @Get('/suggestions')
  getAutocomplete(
    @Query('keyword') keyword: string,
    @Query('limit') limit: string
  ) {
    return this.SachService.searchAutocomplete(
      keyword,
      parsePositiveInt(limit)
    );
  }

  @Get('/search')
  search(
    @Query()
    query: {
      page?: string;
      sortType?: BookSortType;
      filterType?: BookFilterType;
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
    return this.SachService.search(params);
  }

  @Get()
  findAll(
    @Query()
    query: {
      page?: string;
      sortType?: BookSortType;
      filterType?: BookFilterType;
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
    return this.SachService.findAll(params);
  }

  @Get('/isbn/:id')
  findByIsbn(
    @Param('id') id: string,
    @Query('filterType') filterType: BookFilterType
  ) {
    return this.SachService.findByIsbn(id, filterType);
  }

  // Chi tiết sản phẩm
  @Get('/:id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('mode') mode: 'default' | 'full'
  ) {
    return this.SachService.findById(id, mode);
  }

  // Xóa sản phẩm (ẩn - soft delete)
  @Delete('/:id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return this.SachService.delete(id, staffId);
  }
}
