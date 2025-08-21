import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PhiVanChuyenService } from './phi-van-chuyen.service';

import { PhiVanChuyen } from './schemas/phi-van-chuyen.schema';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { CreatePhiVanChuyenDto } from './dto/create-phi-van-chuyen.dto';
import { UpdatePhiVanChuyenDto } from './dto/update-phi-van-chuyen.dto';
import { Roles } from 'src/xac-thuc/xac-thuc.roles.decorator';

@Controller('api/shipping')
export class PhiVanChuyenController {
  constructor(private readonly PhiVanChuyenService: PhiVanChuyenService) {}

  /**
   * Tạo mới phí vận chuyển.
   *
   * @param data Dữ liệu phí vận chuyển cần tạo.
   * @returns Bản ghi phí vận chuyển vừa tạo.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Post()
  async create(@Body() data: CreatePhiVanChuyenDto) {
    return await this.PhiVanChuyenService.create(data);
  }

  /**
   * Lấy danh sách phí vận chuyển cơ bản (chưa xoá).
   *
   * @returns Mảng các bản ghi phí vận chuyển.
   */
  @Get()
  async findAllBasic(): Promise<Partial<PhiVanChuyen>[]> {
    return await this.PhiVanChuyenService.getAll();
  }

  /**
   * Lấy tổng số phí vận chuyển chưa bị xoá.
   *
   * @returns Số lượng phí vận chuyển còn hiệu lực.
   */
  @Get('/total')
  async count(): Promise<any> {
    return await this.PhiVanChuyenService.countAll();
  }

  /**
   * Lấy phí vận chuyển theo ID khu vực (T_id).
   *
   * @param id ID khu vực (T_id).
   * @returns Bản ghi phí vận chuyển tương ứng.
   */
  @Get('inf/:id')
  async getShippingFee(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyenService.getByProvinceId(id);
  }

  /**
   * Lấy chi tiết phí vận chuyển theo ID phí (PVC_id).
   *
   * @param id ID phí vận chuyển.
   * @returns Bản ghi chi tiết phí vận chuyển.
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.PhiVanChuyenService.getById(id);
  }

  /**
   * Cập nhật phí vận chuyển theo ID.
   *
   * @param id ID phí vận chuyển cần cập nhật.
   * @param data Dữ liệu cập nhật.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePhiVanChuyenDto
  ) {
    await this.PhiVanChuyenService.update(id, data);
  }

  /**
   * Xoá (mềm) phí vận chuyển theo ID.
   *
   * @param id ID phí vận chuyển cần xoá.
   * @param staffId ID nhân viên thực hiện thao tác.
   * @returns Bản ghi phí vận chuyển sau khi bị xoá.
   */
  @UseGuards(XacThucGuard)
  @Roles(1, 2)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('staffId') staffId: string
  ) {
    return await this.PhiVanChuyenService.delete(id, staffId);
  }
}
