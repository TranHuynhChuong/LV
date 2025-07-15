import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DiaChiService } from './dia-chi.service';

@Controller('api/location')
export class DiaChiController {
  constructor(private readonly DiaChiService: DiaChiService) {}

  @Get(':id')
  getXaPhuong(@Param('id', ParseIntPipe) id: number) {
    if (id === 0) {
      return this.DiaChiService.getAllProvinces();
    } else return this.DiaChiService.getWardsByProvinceId(id);
  }
}
