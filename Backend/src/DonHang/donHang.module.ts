import { Module } from '@nestjs/common';
import { DonHangService } from './donHang.service';
import { DonHangController } from './donHang.controller';
import { DonHangRepository } from './donHang.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChiTietDonHang,
  ChiTietDonHangSchema,
  DonHang,
  DonHangSchema,
  MaGiamDonHang,
  MaGiamDonHangSchema,
} from './donHang.schema';
import { SanPhamModule } from 'src/SanPham/sanPham.module';
import { TTNhanHangModule } from 'src/TTNhanHang/ttNhanHang.module';
import { MaGiamModule } from 'src/MaGiam/maGiam.module';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';
import { UtilModule } from 'src/Util/util.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DonHang.name, schema: DonHangSchema }]),
    MongooseModule.forFeature([
      { name: ChiTietDonHang.name, schema: ChiTietDonHangSchema },
    ]),
    MongooseModule.forFeature([
      { name: MaGiamDonHang.name, schema: MaGiamDonHangSchema },
    ]),
    SanPhamModule,
    TTNhanHangModule,
    MaGiamModule,
    NguoiDungModule,
    UtilModule,
  ],
  controllers: [DonHangController],
  providers: [DonHangService, DonHangRepository],
  exports: [DonHangService],
})
export class DonHangModule {}
