import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { XacThucGuard } from 'src/xac-thuc/xac-thuc.guard';
import { Roles } from 'src/xac-thuc/xac-thuc.roles.decorator';
import { CreateNhanVienDto } from '../dto/create-nhan-vien.dto';
import { NhanVienResponseDto } from '../dto/response-nhan-vien.dto';
import { UpdateNhanVienDto } from '../dto/update-nhan-vien.dto';
import { NhanVienService } from '../services/nhan-vien.service';

@UseGuards(XacThucGuard)
@Controller('api/users/staffs')
export class NhanVienController {
  constructor(private readonly NhanVienService: NhanVienService) {}

  @Roles(1)
  @Get()
  async getAllStaffs(): Promise<NhanVienResponseDto[]> {
    return await this.NhanVienService.findAll();
  }

  /**
   * Tạo nhân viên mới.
   *
   * @param data Dữ liệu nhân viên cần tạo.
   * @returns Thông tin nhân viên sau khi tạo.
   */
  @Roles(1)
  @Post()
  async createStaff(@Body() data: CreateNhanVienDto) {
    return await this.NhanVienService.create(data);
  }

  /**
   * Lấy thông tin nhân viên theo ID.
   *
   * @param id ID của nhân viên.
   * @returns Thông tin nhân viên.
   */
  @Roles(1)
  @Get('/:id')
  async getStaffById(@Param('id') id: string): Promise<any> {
    return await this.NhanVienService.findById(id);
  }

  /**
   * Cập nhật thông tin nhân viên theo ID.
   *
   * @param id ID nhân viên.
   * @param data Dữ liệu cập nhật.
   * @returns Thông tin sau cập nhật.
   */
  @Roles(1)
  @Put('/:id')
  async updateStaff(@Param('id') id: string, @Body() data: UpdateNhanVienDto) {
    return await this.NhanVienService.update(id, data);
  }
}
