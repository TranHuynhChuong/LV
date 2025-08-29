import { Controller, Get, UseGuards } from '@nestjs/common';
import { KhachHangService } from '../khach-hang/services/khach-hang.service';
import { NhanVienService } from '../nhan-vien/services/nhan-vien.service';
import { XacThucGuard } from '../../xac-thuc/xac-thuc.guard';
import { Roles } from '../../xac-thuc/xac-thuc.roles.decorator';

@UseGuards(XacThucGuard)
@Controller('api/users')
export class NguoiDungController {
  constructor(
    private readonly KhachHangService: KhachHangService,
    private readonly NhanVienService: NhanVienService
  ) {}

  /**
   * Lấy tổng số lượng nhân viên và khách hàng.
   *
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
}
