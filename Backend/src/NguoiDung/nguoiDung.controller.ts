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
import { KhachHangsService } from './KhachHang/khachHang.service';
import { NhanVienService } from './NhanVien/nhanVien.service';
import { UpdateDto as UpdateDto_KH } from './KhachHang/khachHang.dto';
import {
  UpdateDto as UpdateDto_NV,
  CreateDto as CreateDto_NV,
} from './NhanVien/nhanVien.dto';
import { XacThucGuard } from '../XacThuc/xacThuc.guard';
import { Roles } from '../XacThuc/xacThuc.roles.decorator';

@Controller('api/users')
@UseGuards(XacThucGuard)
export class UsersController {
  constructor(
    private readonly KhachHang: KhachHangsService,
    private readonly NhanVien: NhanVienService
  ) {}

  /** Tổng số nhân viên và khách hàng */
  @Roles('Admin')
  @Get('total')
  async getTotal() {
    const staff = await this.NhanVien.countAll();
    const customer = await this.KhachHang.countAll();
    return {
      message: 'Lấy tổng số người dùng thành công',
      data: { staff, customer },
    };
  }

  /** CUSTOMER APIs */

  @Roles('Admin')
  @Get('customers')
  async getAllCustomers(
    @Query('page', ParseIntPipe) page = 0,
    @Query('limit', ParseIntPipe) limit = 24
  ) {
    const result = await this.KhachHang.findAll(page, limit);
    return { message: 'Lấy danh sách khách hàng thành công', data: result };
  }

  @Get('customer/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    const result = await this.KhachHang.findByEmail(email);
    return { message: 'Lấy thông tin khách hàng thành công', data: result };
  }

  @Put('customer/:email')
  async updateCustomer(
    @Param('email') email: string,
    @Body() data: UpdateDto_KH
  ) {
    await this.KhachHang.update(email, data);
    return { message: 'Cập nhật khách hàng thành công' };
  }

  /** STAFF APIs */

  @Roles('Admin')
  @Get('staffs')
  async getAllStaffs() {
    const result = await this.NhanVien.findAll();
    return { message: 'Lấy danh sách nhân viên thành công', data: result };
  }

  @Roles('Admin')
  @Post('staff')
  async createStaff(@Body() data: CreateDto_NV) {
    await this.NhanVien.create(data);
    return { message: 'Nhân viên đã được tạo thành công' };
  }

  @Roles('Admin')
  @Get('staff/:id')
  async getStaffById(@Param('id') id: string) {
    const result = await this.NhanVien.findById(id);
    return { message: 'Lấy thông tin nhân viên thành công', data: result };
  }

  @Roles('Admin')
  @Put('staff/:id')
  async updateStaff(@Param('id') id: string, @Body() data: UpdateDto_NV) {
    await this.NhanVien.update(id, data);
    return { message: 'Cập nhật nhân viên thành công' };
  }

  @Roles('Admin')
  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    await this.NhanVien.delete(id);
    return { message: 'Nhân viên đã được xóa thành công' };
  }
}
