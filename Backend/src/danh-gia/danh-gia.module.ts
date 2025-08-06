import { Module } from '@nestjs/common';
import { DanhGiaService, DanhGiaServiceUtil } from './danh-gia.service';
import { DanhGiaController } from './danh-gia.controller';
import { SachModule } from 'src/sach/sach.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DanhGia, DanhGiaSchema } from './schemas/danh-gia.schema';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import { DanhGiaRepository } from './repositories/danh-gia.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DanhGia.name, schema: DanhGiaSchema }]),
    SachModule,
    NguoiDungModule,
  ],
  controllers: [DanhGiaController],
  providers: [DanhGiaService, DanhGiaServiceUtil, DanhGiaRepository],
  exports: [DanhGiaServiceUtil],
})
export class DanhGiaModule {}
