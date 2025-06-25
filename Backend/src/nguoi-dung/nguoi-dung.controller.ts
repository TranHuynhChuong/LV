import { NhanVien } from './nhan-vien/schemas/nhan-vien.schema';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { KhachHangService } from './khach-hang/khach-hang.service';
import { NhanVienService } from './nhan-vien/nhan-vien.service';
import { XacThucGuard } from '../xac-thuc/xac-thuc.guard';
import { Roles } from '../xac-thuc/xac-thuc.roles.decorator';
import { parsePositiveInt } from 'src/Util/convert';
import { UpdateKhachHangDto } from './khach-hang/dto/update-khach-hang.dto';
import { CreateNhanVienDto } from './nhan-vien/dto/create-nhan-vien.dto';
import { UpdateNhanVienDto } from './nhan-vien/dto/update-nhan-vien.dto';

@Controller('api/users')
@UseGuards(XacThucGuard)
export class NguoiDungController {
  constructor(
    private readonly KhachHangService: KhachHangService,
    private readonly NhanVienService: NhanVienService
  ) {}

  /** Tổng số nhân viên và khách hàng */
  @Roles(1)
  @Get('total')
  async getTotal(): Promise<{ staff: number; customer: number }> {
    const staff = await this.NhanVienService.countAll();
    const customer = await this.KhachHangService.countAll();
    return {
      staff,
      customer,
    };
  }

  /** CUSTOMER APIs */

  @Roles(1)
  @Get('/customers')
  findAll(
    @Query()
    query: {
      page?: number;

      limit?: string;
    }
  ) {
    const { page = '1', limit = '24' } = query;
    const params = {
      page: parsePositiveInt(page),
      limit: parsePositiveInt(limit),
    };

    console.log(params);

    return this.KhachHangService.findAll(params);
  }

  @Get('customer/:id')
  async getCustomerByEmail(@Param('id', ParseIntPipe) id: number) {
    return await this.KhachHangService.findById(id);
  }

  @Put('customer/:id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKhachHangDto
  ) {
    return await this.KhachHangService.update(id, data);
  }

  /** STAFF APIs */

  @Roles(1)
  @Get('staffs')
  async getAllStaffs(): Promise<NhanVien[]> {
    return await this.NhanVienService.findAll();
  }

  @Roles(1)
  @Post('staff')
  async createStaff(@Body() data: CreateNhanVienDto) {
    return await this.NhanVienService.create(data);
  }

  @Roles(1)
  @Get('staff/:id')
  async getStaffById(@Param('id') id: string): Promise<any> {
    return await this.NhanVienService.findById(id);
  }

  @Roles(1)
  @Put('staff/:id')
  async updateStaff(@Param('id') id: string, @Body() data: UpdateNhanVienDto) {
    return await this.NhanVienService.update(id, data);
  }

  @Roles(1)
  @Delete('staff/:id')
  async deleteStaff(
    @Param('id') id: string,
    @Query('staffId') staffId: string
  ) {
    return await this.NhanVienService.delete(id, staffId);
  }
}
