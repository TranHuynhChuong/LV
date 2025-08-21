import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { MaGiamService } from './ma-giam.service';
import { CreateMaGiamDto } from './dto/create-ma-giam.dto';
import { UpdateMaGiamDto } from './dto/update-ma-giam.dto';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { parsePositiveInt } from 'src/Util/convert';
import {
  VoucherFilterType,
  VoucherType,
} from './repositories/ma-giam.repository';
import { Roles } from 'src/xac-thuc/xac-thuc.roles.decorator';

@Controller('api/vouchers')
export class MaGiamController {
  constructor(private readonly MaGiamService: MaGiamService) {}

  /**
   * Tạo mới mã giảm giá.
   * @param data Dữ liệu tạo mã giảm giá
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Post()
  create(@Body() data: CreateMaGiamDto) {
    return this.MaGiamService.create(data);
  }

  /**
   * Lấy danh sách mã giảm giá có phân trang và lọc tùy chọn.
   * @param page Trang cần lấy
   * @param limit Số lượng mỗi trang
   * @param filterType Kiểu lọc hiệu lực (hiện tại, sắp tới, đã hết hạn...)
   * @param type Kiểu mã giảm (theo % hoặc số tiền)
   */
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filterType') filterType?: VoucherFilterType,
    @Query('type') type?: VoucherType
  ) {
    return this.MaGiamService.getAll({
      page: parsePositiveInt(page) ?? 1,
      limit: parsePositiveInt(limit) ?? 10,
      filterType: filterType,
      type: type,
    });
  }

  /**
   * Lấy toàn bộ mã giảm giá đang còn hiệu lực (không phân trang).
   */
  @Get('/all-valid')
  findAllvalid() {
    return this.MaGiamService.getAllValid();
  }

  /**
   * Đếm số lượng mã giảm giá đang còn hiệu lực.
   */
  @Get('/total')
  async count(): Promise<any> {
    return await this.MaGiamService.countValid();
  }

  /**
   * Lấy chi tiết mã giảm giá theo ID kèm tùy chọn lọc.
   * @param id Mã ID của mã giảm
   * @param filterType Kiểu lọc hiệu lực (tuỳ chọn)
   * @param type Kiểu mã giảm (tuỳ chọn)
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('filterType') filterType?: VoucherFilterType,
    @Query('type') type?: VoucherType
  ): Promise<ReturnType<typeof this.MaGiamService.getById>> {
    return this.MaGiamService.getById(id, filterType, type);
  }

  /**
   * Cập nhật thông tin mã giảm giá theo ID.
   * @param id ID mã giảm
   * @param data Dữ liệu cập nhật
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateMaGiamDto) {
    return this.MaGiamService.update(id, data);
  }

  /**
   * Xóa mã giảm giá theo ID.
   * @param id ID mã giảm
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.MaGiamService.delete(id);
  }
}
