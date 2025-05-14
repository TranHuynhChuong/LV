import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CustomerService } from './Customer/customer.service';
import { StaffService } from './Staff/staff.service';
import { CreateCustomerDto } from './Customer/customer.dto';
import { CreateStaffDto } from './Staff/staff.dto';

@Controller('api/accounts')
export class UserController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly staffService: StaffService
  ) {}

  @Get()
  async getAll() {
    const result = {};
    try {
      result['customer'] = await this.customerService.findAll();
      result['staff'] = await this.staffService.findAll();
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lỗi khi lấy dữ liệu từ server');
    }
  }

  /********************** Customer APIs ************************/

  @Post('customer')
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      await this.customerService.create(createCustomerDto);
      return { message: 'Customer created successfully' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể tạo khách hàng');
    }
  }

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

  @Get('customer-all')
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

  /********************** Staff APIs ************************/

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

  @Get('staff/:id')
  async getStaffById(@Param('id') id: string) {
    try {
      const staff = await this.staffService.findOneById(id);
      if (!staff) {
        throw new BadRequestException('Nhân viên không tồn tại');
      }
      return staff;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể tìm thấy nhân viên');
    }
  }

  @Put('staff/:id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateStaffDto: CreateStaffDto
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

  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    try {
      const deletedStaff = await this.staffService.delete(id);
      if (!deletedStaff) {
        throw new BadRequestException('Không thể xóa nhân viên');
      }
      return { message: 'Nhân viên đã được xóa thành công' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Không thể xóa nhân viên');
    }
  }
}
