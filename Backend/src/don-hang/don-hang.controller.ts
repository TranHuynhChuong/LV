import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Patch,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { DonHangService } from './don-hang.service';
import { CheckDto, CreateDto } from './dto/create-don-hang.dto';
import { parsePositiveInt } from 'src/Util/convert';
import { OrderStatus } from './repositories/don-hang.repository';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';

@Controller('api/orders')
export class DonHangController {
  constructor(private readonly DonHangService: DonHangService) {}

  /**
   * Tạo mới đơn hàng
   *
   * @param data - Dữ liệu tạo đơn hàng
   * @returns Đơn hàng vừa tạo
   */
  @Post()
  create(@Body() data: CreateDto) {
    return this.DonHangService.create(data);
  }

  /**
   * Kiểm tra hợp lệ của đơn hàng trước khi tạo
   *
   * @param data - Dữ liệu kiểm tra
   * @returns Kết quả kiểm tra
   */
  @Post('/check')
  check(@Body() data: CheckDto) {
    return this.DonHangService.checkValid(data);
  }

  /**
   * Cập nhật trạng thái đơn hàng
   *
   * @param id - Mã đơn hàng
   * @param status - Trạng thái mới
   * @param staffId - ID nhân viên thực hiện
   * @returns Đơn hàng đã cập nhật
   */
  @Patch('/:status/:id')
  async updateStatusByPath(
    @Param('id') id: string,
    @Param('status') status: OrderStatus,
    @Body('staffId') staffId: string
  ) {
    return this.DonHangService.update(id, status, staffId);
  }

  /**
   * Lấy danh sách đơn hàng theo phân trang và bộ lọc
   *
   * @param page - Trang cần lấy
   * @param limit - Số đơn hàng mỗi trang
   * @param filterType - Lọc theo trạng thái
   * @param orderId - Mã đơn hàng cần tìm (tùy chọn)
   * @param from - Ngày bắt đầu (tùy chọn)
   * @param to - Ngày kết thúc (tùy chọn)
   * @returns Danh sách đơn hàng
   */
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: OrderStatus,
    @Query('orderId') orderId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    return this.DonHangService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 24,
      filterType: filterType,
      orderId: orderId,
      from: start,
      to: end,
    });
  }

  /**
   * Lấy danh sách đơn hàng của người dùng theo phân trang
   *
   * @param page - Trang cần lấy
   * @param limit - Số đơn hàng mỗi trang
   * @param filterType - Trạng thái cần lọc
   * @param userId - ID người dùng
   * @param orderId - Mã đơn hàng cần tìm (tùy chọn)
   * @returns Danh sách đơn hàng
   */
  @Get('/user')
  async findAllOfUser(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType: OrderStatus,
    @Query('userId') userId: number,
    @Query('orderId') orderId?: string
  ) {
    return this.DonHangService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 24,
      filterType: filterType,
      orderId: orderId,
      userId: userId,
    });
  }

  /**
   * Đếm tổng số đơn hàng (theo từng trạng thái) theo khoảng thời gian
   *
   * @param from - Ngày bắt đầu
   * @param to - Ngày kết thúc
   * @returns Tổng số đơn hàng
   */
  @Get('/total')
  async count(
    @Query('from') from?: string,
    @Query('to') to?: string
  ): Promise<any> {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    return await this.DonHangService.countAll(start, end);
  }

  /**
   * Tìm đơn hàng theo mã đơn
   *
   * @param id - Mã đơn hàng
   * @returns Chi tiết đơn hàng
   */
  @Get('/find/:id')
  async search(@Param('id') id: string): Promise<any> {
    return this.DonHangService.searchOrder(id.toUpperCase());
  }

  /**
   * Lấy chi tiết đơn hàng theo mã đơn và trạng thái
   *
   * @param id - Mã đơn hàng
   * @param filterType - Trạng thái lọc (tùy chọn)
   * @returns Chi tiết đơn hàng
   */
  @Get('/detail/:id')
  async getDetail(
    @Param('id') id: string,
    @Query('filterType') filterType: OrderStatus
  ): Promise<any> {
    return this.DonHangService.findById(id.toUpperCase(), filterType);
  }

  /**
   * Thống kê bán hàng theo khoảng thời gian
   *
   * @param from - Ngày bắt đầu
   * @param to - Ngày kết thúc
   * @returns Dữ liệu thống kê
   */
  @UseGuards(XacThucGuard)
  @Get('/stats')
  getStats(@Query('from') from: string, @Query('to') to: string) {
    const start = new Date(from);
    const end = new Date(to);
    return this.DonHangService.getStatsByDateRange(start, end);
  }

  /**
   * Xuất báo cáo thống kê đơn hàng ra file Excel
   *
   * @param from - Ngày bắt đầu
   * @param to - Ngày kết thúc
   * @param staffId - ID nhân viên
   * @param res - Đối tượng Response để gửi file
   */
  @UseGuards(XacThucGuard)
  @Get('/stats/export')
  async exportStats(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('staffId') staffId: string,
    @Res() res: Response
  ) {
    if (!from && !to) return;
    const start = new Date(from);
    const end = new Date(to);
    const { buffer, fileName } =
      await this.DonHangService.getExcelReportStatsByDateRange(
        start,
        end,
        staffId
      );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
