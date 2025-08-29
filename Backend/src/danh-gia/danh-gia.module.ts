import { Module } from '@nestjs/common';
import {
  DanhGiaService,
  DanhGiaServiceUtil,
} from './services/danh-gia.service';
import { DanhGiaController } from './controllers/danh-gia.controller';
import { SachModule } from 'src/sach/sach.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DanhGia, DanhGiaSchema } from './schemas/danh-gia.schema';
import { DanhGiaRepository } from './repositories/danh-gia.repository';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DanhGia.name, schema: DanhGiaSchema }]),
    SachModule,
    LichSuThaoTacModule,
  ],
  controllers: [DanhGiaController],
  providers: [DanhGiaService, DanhGiaServiceUtil, DanhGiaRepository],
  exports: [DanhGiaServiceUtil],
})
export class DanhGiaModule {}
