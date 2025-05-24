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
import { CustomersService } from './Customers/customer.service';
import { StaffsService } from './Staffs/staffs.service';
import { UpdateCustomerDto } from './Customers/customers.dto';
import { CreateStaffDto, UpdateStaffDto } from './Staffs/staffs.dto';
import { AuthGuard } from '../Auth/auth.guard';
import { Roles } from '../Auth/auth.roles.decorator';

@Controller('api/users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly customerService: CustomersService,
    private readonly staffService: StaffsService
  ) {}

  /** Tổng số nhân viên và khách hàng */
  @Roles('Admin')
  @Get('total')
  async getTotal() {
    const staff = await this.staffService.countAll();
    const customer = await this.customerService.countAll();
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
    const result = await this.customerService.findAll(page, limit);
    return { message: 'Lấy danh sách khách hàng thành công', data: result };
  }

  @Get('customer/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    const customer = await this.customerService.findByEmail(email);
    return { message: 'Lấy thông tin khách hàng thành công', data: customer };
  }

  @Put('customer/:email')
  async updateCustomer(
    @Param('email') email: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    await this.customerService.update(email, updateCustomerDto);
    return { message: 'Cập nhật khách hàng thành công' };
  }

  /** STAFF APIs */

  @Roles('Admin')
  @Get('staffs')
  async getAllStaffs() {
    const result = await this.staffService.findAll();
    return { message: 'Lấy danh sách nhân viên thành công', data: result };
  }

  @Roles('Admin')
  @Post('staff')
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    await this.staffService.create(createStaffDto);
    return { message: 'Nhân viên đã được tạo thành công' };
  }

  @Roles('Admin')
  @Get('staff/:id')
  async getStaffById(@Param('id') id: string) {
    const result = await this.staffService.findById(id);
    return { message: 'Lấy thông tin nhân viên thành công', data: result };
  }

  @Roles('Admin')
  @Put('staff/:id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto
  ) {
    await this.staffService.update(id, updateStaffDto);
    return { message: 'Cập nhật nhân viên thành công' };
  }

  @Roles('Admin')
  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    await this.staffService.delete(id);
    return { message: 'Nhân viên đã được xóa thành công' };
  }
}
