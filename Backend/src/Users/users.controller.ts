import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  InternalServerErrorException,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomersService } from './Customers/customer.service';
import { StaffsService } from './Staffs/staffs.service';
import { CreateCustomerDto } from './Customers/customers.dto';
import { CreateStaffDto, UpdateStaffDto } from './Staffs/staffs.dto';

import { AuthGuard } from '../Auth/auth.guard';
import { Roles } from '../Auth/auth.roles.decorator';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly customerService: CustomersService,
    private readonly staffService: StaffsService
  ) {}

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Get('total')
  async getTotal() {
    try {
      const staff = await this.staffService.countAll();
      const customer = await this.customerService.countAll();
      return { staff, customer };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Lỗi khi lấy danh sách khách hàng'
      );
    }
  }

  /********************** Customer APIs ************************/

  @UseGuards(AuthGuard)
  @Get('customer/:id')
  async getCustomerById(@Param('id') id: string) {
    try {
      const customer = await this.customerService.findOne(id);
      if (!customer) {
        throw new BadRequestException('Khách hàng không tồn tại');
      }
      return customer;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể tìm thấy khách hàng');
    }
  }

  @UseGuards(AuthGuard)
  @Put('customer/:id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: CreateCustomerDto
  ) {
    try {
      const updatedCustomer = await this.customerService.update(
        id,
        updateCustomerDto
      );
      if (!updatedCustomer) {
        throw new BadRequestException('Không thể cập nhật khách hàng');
      }
      return updatedCustomer;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể cập nhật khách hàng');
    }
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Get('customers')
  async getAllCustomers(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    try {
      return await this.customerService.findAll(page, limit);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Lỗi khi lấy danh sách khách hàng'
      );
    }
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Get('customer-get-by-email')
  async getCustomerByEmail(@Query('email') email: string) {
    try {
      return await this.customerService.findByEmail(email);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Lỗi khi lấy danh sách khách hàng'
      );
    }
  }

  /********************** Staff APIs ************************/
  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Get('staffs')
  async getAll() {
    try {
      const result = await this.staffService.findAll();
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lỗi khi lấy dữ liệu từ server');
    }
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Post('staff')
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    try {
      const staff = await this.staffService.create(createStaffDto);
      return { message: 'Staff created successfully', staff };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể tạo nhân viên');
    }
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Get('staff/:id')
  async getStaffById(@Param('id') id: string) {
    try {
      const result = await this.staffService.findOneById(id);
      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể tìm thấy nhân viên');
    }
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Put('staff/:id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto
  ) {
    try {
      const updatedStaff = await this.staffService.update(id, updateStaffDto);
      if (!updatedStaff) {
        throw new BadRequestException('Không thể cập nhật nhân viên');
      }
      return updatedStaff;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể cập nhật nhân viên');
    }
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    try {
      await this.staffService.delete(id);
      return { message: 'Nhân viên đã được xóa thành công' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể xóa nhân viên');
    }
  }
}
