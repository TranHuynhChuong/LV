import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { UpdateDanhGiaDto } from './dto/update-danh-gia.dto';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';

@Controller('/api/reviews')
export class DanhGiaController {
  constructor(private readonly DanhGiaService: DanhGiaService) {}

  /**
   * Tạo một hoặc nhiều đánh giá cho sản phẩm.
   *
   * @param dto - Mảng đánh giá cần tạo
   * @returns Danh sách đánh giá đã tạo
   */
  @UseGuards(XacThucGuard)
  @Post()
  create(@Body() dto: CreateDanhGiaDto[]) {
    return this.DanhGiaService.create(dto);
  }

  /**
   * Lấy danh sách đánh giá (tùy chọn lọc theo đánh giá, thời gian, trạng thái).
   *
   * @param page - Trang cần lấy đánh giá
   * @param limit - Số đánh giá mỗi trang (mặc định: 24)
   * @param rating - Điểm đánh giá cụ thể (tuỳ chọn)
   * @param from - Ngày bắt đầu (tuỳ chọn, định dạng ISO)
   * @param to - Ngày kết thúc (tuỳ chọn, định dạng ISO)
   * @param status - Trạng thái đánh giá: all, visible, hidden
   * @returns Danh sách đánh giá đã lọc và phân trang
   */
  @Get('all')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('rating') rating?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: 'all' | 'visible' | 'hidden'
  ): Promise<unknown> {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    return this.DanhGiaService.findAll({
      page: page,
      limit: limit,
      rating: rating ? +rating : undefined,
      from: start,
      to: end,
      status: status,
    });
  }

  /**
   * Lấy danh sách đánh giá của một sách cụ thể theo phân trang.
   *
   * @param bookId - ID của sách
   * @param page - Trang cần lấy
   * @param limit - Số đánh giá mỗi trang (mặc định: 24)
   * @returns Danh sách đánh giá của sách
   */
  @Get('/book/:bookId')
  findAllOfBook(
    @Param('bookId') spId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '24'
  ) {
    return this.DanhGiaService.findAllOfBook(
      +spId,
      parseInt(page),
      parseInt(limit)
    );
  }

  /**
   * API: Lấy danh sách đánh giá của một đơn hàng
   *
   * @param orderId Mã đơn hàng
   */
  @Get('order/:orderId')
  getReviewsOfOrder(@Param('orderId') orderId: string) {
    return this.DanhGiaService.findAllOfOrder(orderId);
  }

  /**
   * API: Lấy danh sách đánh giá của một khách hàng
   *
   * @param customerId Mã khách hàng
   * @param page Số trang (mặc định 1)
   * @param limit Số lượng trên mỗi trang (mặc định 24)
   */
  @UseGuards(XacThucGuard)
  @Get('customer/:customerId')
  getReviewsOfCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
  ) {
    return this.DanhGiaService.findAllOfCustomer(customerId, page, limit);
  }

  /**
   * Thống kê số lượng đánh giá trong khoảng thời gian.
   *
   * @param from - Ngày bắt đầu (ISO format)
   * @param to - Ngày kết thúc (ISO format)
   * @returns Dữ liệu thống kê đánh giá
   */
  @UseGuards(XacThucGuard)
  @Get('/stats')
  async getRatingStats(@Query('from') from: string, @Query('to') to: string) {
    const start = new Date(from);
    const end = new Date(to);
    return this.DanhGiaService.getRatingStats(start, end);
  }

  /**
   * Ẩn một đánh giá khỏi danh sách hiển thị.
   *
   * @param dto - Thông tin đánh giá cần ẩn
   * @returns Đánh giá đã được cập nhật
   */
  @UseGuards(XacThucGuard)
  @Patch('/hide')
  async hide(@Body() dto: UpdateDanhGiaDto) {
    return this.DanhGiaService.hide(dto);
  }

  /**
   * Hiển thị một đánh giá đã bị ẩn trước đó.
   *
   * @param dto - Thông tin đánh giá cần hiển thị lại
   * @returns Đánh giá đã được cập nhật
   */
  @UseGuards(XacThucGuard)
  @Patch('/show')
  async show(@Body() dto: UpdateDanhGiaDto) {
    return this.DanhGiaService.show(dto);
  }
}
