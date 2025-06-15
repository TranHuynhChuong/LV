import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KhuyenMai,
  KhuyenMaiSchema,
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiSchema,
} from './khuyenMai.schema';
import { KhuyenMaiRepository } from './khuyenMai.repository';
import { KhuyenMaiService, KhuyenMaiUtilService } from './khuyenMai.service';
import { KhuyenMaiController } from './khuyenMai.controller';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhuyenMai.name, schema: KhuyenMaiSchema },
      { name: ChiTietKhuyenMai.name, schema: ChiTietKhuyenMaiSchema },
    ]),
    NguoiDungModule,
  ],
  providers: [KhuyenMaiRepository, KhuyenMaiService, KhuyenMaiUtilService],
  controllers: [KhuyenMaiController],
  exports: [KhuyenMaiUtilService],
})
export class KhuyenMaiModule {}
