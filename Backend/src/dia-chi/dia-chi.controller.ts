import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DiaChiService } from './dia-chi.service';

@Controller('api/location')
export class DiaChiController {
  constructor(private readonly DiaChiService: DiaChiService) {}

  /**
   * Lấy danh sách xã/phường theo mã tỉnh/thành phố.
   * Nếu `id` bằng 0, trả về danh sách tất cả tỉnh/thành phố.
   * @param id Mã tỉnh/thành phố (0 để lấy tất cả tỉnh/thành)
   * @returns Danh sách xã/phường hoặc tỉnh/thành phố
   */
  @Get(':id')
  findWardsOrProvinces(@Param('id', ParseIntPipe) id: number) {
    if (id === 0) {
      return this.DiaChiService.findAllProvinces();
    } else return this.DiaChiService.findWardsByProvinceId(id);
  }

  /**
   * Yêu cầu làm mới (tải lại) dữ liệu địa chỉ
   * @returns Kết quả thao tác làm mới dữ liệu
   */
  @Get('refetch')
  refetchData() {
    return this.DiaChiService.refetchLocation();
  }
}
