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
import { ChiTietDonHangRepository } from './repositories/chi-tiet-don-hang.repository';
import { DiaChiModule } from 'src/dia-chi/dia-chi.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DonHang.name, schema: DonHangSchema }]),
    MongooseModule.forFeature([
      { name: ChiTietDonHang.name, schema: ChiTietDonHangSchema },
    ]),

    SanPhamModule,
    TTNhanHangModule,
    MaGiamModule,
    NguoiDungModule,
    UtilModule,
    DiaChiModule,
  ],
  controllers: [DonHangController],
  providers: [DonHangService, DonHangRepository, ChiTietDonHangRepository],
  exports: [DonHangService],
})
export class DonHangModule {}
