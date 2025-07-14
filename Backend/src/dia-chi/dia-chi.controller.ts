import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DiaChiService } from './dia-chi.service';

@Controller('api/address')
export class DiaChiController {
  constructor(private readonly service: DiaChiService) {}

  @Get(':id')
  getXaPhuong(@Param('id', ParseIntPipe) id: number) {
    if (id === 0) {
      return this.service.getDanhSachTinh();
    } else return this.service.getXaPhuongTheoTinh(id);
  }
}
