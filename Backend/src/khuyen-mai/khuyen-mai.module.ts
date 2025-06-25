import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KhuyenMai, KhuyenMaiSchema } from './schemas/khuyen-mai.schema';
import { KhuyenMaiRepository } from './repositories/khuyen-mai.repository';
import { KhuyenMaiService, KhuyenMaiUtilService } from './khuyen-mai.service';
import { KhuyenMaiController } from './khuyen-mai.controller';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import {
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiSchema,
} from './schemas/chi-tiet-khuyen-mai.schema';
import { ChiTietKhuyenMaiRepository } from './repositories/chi-tiet-khuyen-mai.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhuyenMai.name, schema: KhuyenMaiSchema },
      { name: ChiTietKhuyenMai.name, schema: ChiTietKhuyenMaiSchema },
    ]),
    NguoiDungModule,
  ],
  providers: [
    KhuyenMaiRepository,
    KhuyenMaiService,
    KhuyenMaiUtilService,
    ChiTietKhuyenMaiRepository,
  ],
  controllers: [KhuyenMaiController],
  exports: [KhuyenMaiUtilService],
})
export class KhuyenMaiModule {}
