import { Module } from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { DanhGiaController } from './danh-gia.controller';
import { SanPhamModule } from 'src/san-pham/san-pham.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DanhGia, DanhGiaSchema } from './schemas/danh-gia.schema';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import { DanhGiaRepository } from './repositories/danh-gia.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DanhGia.name, schema: DanhGiaSchema }]),
    SanPhamModule,
    NguoiDungModule,
  ],
  controllers: [DanhGiaController],
  providers: [DanhGiaService, DanhGiaRepository],
})
export class DanhGiaModule {}
