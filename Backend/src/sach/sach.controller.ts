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

  /**
   * Tạo mới sách kèm theo upload ảnh bìa và ảnh khác
   *
   * @param files Mảng file upload, có thể bao gồm coverImageFile và imageFiles
   * @param body Dữ liệu sách
   * @returns Thông tin sách vừa tạo
   */
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

  /**
   * Cập nhật sách theo id, có thể kèm upload ảnh mới
   *
   * @param id Id sách cần cập nhật
   * @param files Mảng file upload, có thể bao gồm coverImageFile và imageFiles
   * @param body Dữ liệu cập nhật sách
   * @returns Thông tin sách đã cập nhật
   */
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
    return this.SachService.update(id, body, coverImage, images);
  }

  /**
   * Tìm sách bằng vector embedding qua POST
   *
   * @param body Chứa vector truy vấn, giới hạn kết quả và điểm tối thiểu
   * @returns Danh sách sách tìm được
   */
  @Post('/find')
  findByVectorViaPost(
    @Body() body: { vector: number[]; limit?: number; minScore?: number }
  ) {
    const { vector, limit, minScore } = body;
    return this.SachService.findByVector(vector, limit, minScore);
  }

  /**
   * Đếm tổng số sách theo trạng thái
   *
   * @returns Thống kê tổng số sách
   */
  @Get('/total')
  countAll() {
    return this.SachService.countAll();
  }

  /**
   * Lấy danh sách đề xuất autocomplete theo từ khóa
   *
   * @param keyword Từ khóa tìm kiếm
   * @param limit Số lượng kết quả trả về (chuỗi, sẽ chuyển thành số)
   * @returns Danh sách đề xuất
   */
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

  /**
   * Tìm sách theo các tiêu chí tìm kiếm (trang, lọc, sắp xếp, từ khóa, thể loại)
   *
   * @param query Các tham số tìm kiếm
   * @returns Danh sách sách phù hợp
   */
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

  /**
   * Lấy danh sách sách theo phân trang, sắp xếp, lọc
   *
   * @param query Tham số phân trang, lọc, sắp xếp
   * @returns Danh sách sách
   */
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

  /**
   * Tìm sách theo mã ISBN
   *
   * @param id Mã ISBN sách
   * @param filterType Loại lọc sách
   * @returns Thông tin sách nếu tìm thấy
   */
  @Get('/isbn/:id')
  findByIsbn(
    @Param('id') id: string,
    @Query('filterType') filterType: BookFilterType
  ) {
    return this.SachService.findByIsbn(id, filterType);
  }

  /**
   * Lấy chi tiết sách theo ID với chế độ mặc định hoặc đầy đủ
   *
   * @param id ID sách
   * @param mode Chế độ trả về 'default' hoặc 'full'
   * @returns Thông tin sách
   */
  @Get('/:id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('mode') mode: 'default' | 'full'
  ) {
    return this.SachService.findById(id, mode);
  }

  /**
   * Xóa sách theo ID
   *
   * @param id ID sách cần xóa
   * @param staffId ID nhân viên thực hiện thao tác xóa
   * @returns Thông tin sách sau khi xóa (đánh dấu xóa)
   */
  @Delete('/:id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return this.SachService.delete(id, staffId);
  }
}
