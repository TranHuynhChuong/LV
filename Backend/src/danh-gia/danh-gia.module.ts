import { Module } from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { DanhGiaController } from './danh-gia.controller';

@Module({
  controllers: [DanhGiaController],
  providers: [DanhGiaService],
})
export class DanhGiaModule {}
