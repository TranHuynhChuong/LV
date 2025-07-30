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

  /**
   * Lấy tổng số lượng nhân viên và khách hàng.
   * @returns Số lượng nhân viên và khách hàng.
   */
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

  /**
   * Lấy danh sách khách hàng phân trang.
   * @param query.page Trang cần lấy (mặc định: 1).
   * @param query.limit Số lượng mỗi trang (mặc định: 24).
   * @returns Danh sách khách hàng theo phân trang.
   */
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
    return this.KhachHangService.findAll(params);
  }

  /**
   * Lấy thông tin khách hàng theo địa chỉ email.
   * @param email Địa chỉ email cần tìm.
   * @returns Thông tin khách hàng.
   */
  @Get('customer/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    return await this.KhachHangService.findByEmail(email);
  }

  /**
   * Cập nhật thông tin khách hàng theo ID.
   * @param id ID của khách hàng.
   * @param data Dữ liệu cập nhật.
   * @returns Thông tin sau khi cập nhật.
   */
  @Put('customer/:id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKhachHangDto
  ) {
    return await this.KhachHangService.update(id, data);
  }

  /**
   * Lấy danh sách toàn bộ nhân viên.
   * @returns Danh sách nhân viên.
   */
  @Roles(1)
  @Get('staffs')
  async getAllStaffs(): Promise<NhanVien[]> {
    return await this.NhanVienService.findAll();
  }

  /**
   * Tạo nhân viên mới.
   * @param data Dữ liệu nhân viên cần tạo.
   * @returns Thông tin nhân viên sau khi tạo.
   */
  @Roles(1)
  @Post('staff')
  async createStaff(@Body() data: CreateNhanVienDto) {
    return await this.NhanVienService.create(data);
  }

  /**
   * Lấy thông tin nhân viên theo ID.
   * @param id ID của nhân viên.
   * @returns Thông tin nhân viên.
   */
  @Roles(1)
  @Get('staff/:id')
  async getStaffById(@Param('id') id: string): Promise<any> {
    return await this.NhanVienService.findById(id);
  }

  /**
   * Cập nhật thông tin nhân viên theo ID.
   * @param id ID nhân viên.
   * @param data Dữ liệu cập nhật.
   * @returns Thông tin sau cập nhật.
   */
  @Roles(1)
  @Put('staff/:id')
  async updateStaff(@Param('id') id: string, @Body() data: UpdateNhanVienDto) {
    return await this.NhanVienService.update(id, data);
  }

  /**
   * Xóa mềm nhân viên (đánh dấu đã xóa).
   * @param id ID nhân viên bị xóa.
   * @param staffId ID người thực hiện thao tác xóa.
   * @returns Kết quả xóa.
   */
  @Roles(1)
  @Delete('staff/:id')
  async deleteStaff(
    @Param('id') id: string,
    @Query('staffId') staffId: string
  ) {
    return await this.NhanVienService.delete(id, staffId);
  }
}
