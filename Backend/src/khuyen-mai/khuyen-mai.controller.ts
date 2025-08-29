import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { KhuyenMaiService } from './khuyen-mai.service';
import { CreateKhuyenMaiDto } from './dto/create-khuyen-mai.dto';
import { UpdateKhuyenMaiDto } from './dto/update-khuyen-mai.dto';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import { PromotionFilterType } from './repositories/khuyen-mai.repository';
import { Roles } from 'src/xac-thuc/xac-thuc.roles.decorator';

@Controller('api/promotions')
export class KhuyenMaiController {
  constructor(private readonly KhuyenMaiService: KhuyenMaiService) {}

  /**
   * Tạo mới một khuyến mãi.
   *
   * @param {CreateKhuyenMaiDto} data - Dữ liệu khuyến mãi cần tạo.
   * @returns  Đối tượng khuyến mãi vừa được tạo.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Post()
  create(@Body() data: CreateKhuyenMaiDto) {
    return this.KhuyenMaiService.create(data);
  }

  /**
   * Lấy danh sách khuyến mãi có phân trang và lọc theo loại khuyến mãi (nếu có).
   *
   * @param {string} page - Số trang hiện tại (bắt đầu từ 1).
   * @param {string} limit - Số lượng bản ghi mỗi trang.
   * @param {PromotionFilterType} [filterType] - (Tùy chọn) Loại khuyến mãi để lọc.
   */
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType?: PromotionFilterType
  ) {
    return this.KhuyenMaiService.findAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: filterType,
    });
  }

  /**
   * Đếm số lượng khuyến mãi còn hiệu lực.
   *
   * @returns {Promise<number>} Tổng số khuyến mãi đang còn hiệu lực.
   */
  @Get('/total')
  async count(): Promise<any> {
    return await this.KhuyenMaiService.countValid();
  }

  /**
   * Lấy thông tin chi tiết của một khuyến mãi theo ID.
   *
   * @param {number} id - ID của khuyến mãi cần tìm.
   * @param {PromotionFilterType} [filterType] - (Tùy chọn) Lọc chi tiết theo loại khuyến mãi.
   * @returns {Promise<any>} Đối tượng khuyến mãi tương ứng nếu tìm thấy.
   */
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('filterType') filterType?: PromotionFilterType
  ): Promise<ReturnType<typeof this.KhuyenMaiService.findById>> {
    return this.KhuyenMaiService.findById(id, filterType);
  }

  /**
   * Cập nhật thông tin khuyến mãi theo ID.
   *
   * @param {number} id - ID của khuyến mãi cần cập nhật.
   * @param {UpdateKhuyenMaiDto} data - Dữ liệu cập nhật.
   * @returns  Đối tượng khuyến mãi sau khi cập nhật thành công.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKhuyenMaiDto
  ) {
    return this.KhuyenMaiService.update(id, data);
  }

  /**
   * Xóa khuyến mãi theo ID, nếu khuyến mãi chưa hoặc không còn hiệu lực.
   *
   * @param {number} id - ID của khuyến mãi cần xóa.
   * @returns Xóa thành công sẽ không trả về dữ liệu.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.KhuyenMaiService.delete(id);
  }
}
