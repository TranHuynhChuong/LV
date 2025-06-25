import { Module } from '@nestjs/common';
import { DonHangService } from './don-hang.service';
import { DonHangController } from './don-hang.controller';
import { DonHangRepository } from './repositories/don-hang.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DonHang, DonHangSchema } from './schemas/don-hang.schema';
import { SanPhamModule } from 'src/san-pham/san-pham.module';
import { TTNhanHangModule } from 'src/tt-nhan-hang/tt-nhan-hang.module';
import { MaGiamModule } from 'src/ma-giam/ma-giam.module';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import { UtilModule } from 'src/Util/util.module';
import {
  ChiTietDonHang,
  ChiTietDonHangSchema,
} from './schemas/chi-tiet-don-hang.schema';
import {
  MaGiamDonHang,
  MaGiamDonHangSchema,
} from './schemas/ma-giam-don-hang.schema';
import { ChiTietDonHangRepository } from './repositories/chi-tiet-don-hang.repository';
import { MaGiamDonHangRepository } from './repositories/ma-giam-don-hang.repository';

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
  providers: [
    DonHangService,
    DonHangRepository,
    ChiTietDonHangRepository,
    MaGiamDonHangRepository,
  ],
  exports: [DonHangService],
})
export class DonHangModule {}
