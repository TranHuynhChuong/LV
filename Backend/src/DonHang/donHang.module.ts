import { Module } from '@nestjs/common';
import { DonHangService } from './donHang.service';
import { DonHangController } from './donHang.controller';
import { DonHangRepository } from './repositories/donHang.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DonHang, DonHangSchema } from './schemas/donHang.schema';
import { SanPhamModule } from 'src/SanPham/sanPham.module';
import { TTNhanHangModule } from 'src/TTNhanHang/ttNhanHang.module';
import { MaGiamModule } from 'src/MaGiam/maGiam.module';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';
import { UtilModule } from 'src/Util/util.module';
import {
  ChiTietDonHang,
  ChiTietDonHangSchema,
} from './schemas/chiTietDonHang.schema';
import {
  MaGiamDonHang,
  MaGiamDonHangSchema,
} from './schemas/maGiamDonHang.schema';

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
