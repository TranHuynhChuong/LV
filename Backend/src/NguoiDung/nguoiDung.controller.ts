import { NhanVien } from './NhanVien/nhanVien.schema';
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
} from '@nestjs/common';
import { KhachHangsService } from './KhachHang/khachHang.service';
import { NhanVienService } from './NhanVien/nhanVien.service';
import { UpdateDto as UpdateDto_KH } from './KhachHang/khachHang.dto';
import {
  UpdateDto as UpdateDto_NV,
  CreateDto as CreateDto_NV,
} from './NhanVien/nhanVien.dto';
import { XacThucGuard } from '../XacThuc/xacThuc.guard';
import { Roles } from '../XacThuc/xacThuc.roles.decorator';
import { parsePositiveInt } from 'src/Util/convert';

@Controller('api/users')
@UseGuards(XacThucGuard)
export class NguoiDungController {
  constructor(
    private readonly KhachHangsService: KhachHangsService,
    private readonly NhanVienService: NhanVienService
  ) {}

  /** Tổng số nhân viên và khách hàng */
  @Roles(1)
  @Get('total')
  async getTotal(): Promise<{ staff: number; customer: number }> {
    const staff = await this.NhanVienService.countAll();
    const customer = await this.KhachHangsService.countAll();
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

    return this.KhachHangsService.findAll(params);
  }

  @Get('customer/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    return await this.KhachHangsService.findByEmail(email);
  }

  @Put('customer/:email')
  async updateCustomer(
    @Param('email') email: string,
    @Body() data: UpdateDto_KH
  ) {
    return await this.KhachHangsService.update(email, data);
  }

  /** STAFF APIs */

  @Roles(1)
  @Get('staffs')
  async getAllStaffs(): Promise<NhanVien[]> {
    return await this.NhanVienService.findAll();
  }

  @Roles(1)
  @Post('staff')
  async createStaff(@Body() data: CreateDto_NV) {
    return await this.NhanVienService.create(data);
  }

  @Roles(1)
  @Get('staff/:id')
  async getStaffById(@Param('id') id: string): Promise<any> {
    return await this.NhanVienService.findById(id);
  }

  @Roles(1)
  @Put('staff/:id')
  async updateStaff(@Param('id') id: string, @Body() data: UpdateDto_NV) {
    return await this.NhanVienService.update(id, data);
  }

  @Roles(1)
  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    return await this.NhanVienService.delete(id);
  }
}
