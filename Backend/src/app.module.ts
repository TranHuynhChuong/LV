import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { NguoiDungModule } from './nguoi-dung/nguoi-dung.module';
import { UtilModule } from './Util/util.module';
import { XacThucModule } from './xac-thuc/xac-thuc.module';
import { TheLoaiModule } from './the-loai/the-loai.module';
import { SachModule } from './sach/sach.module';
import { KhuyenMaiModule } from './khuyen-mai/khuyen-mai.module';
import { GioHangModule } from './gio-hang/gio-hang.module';
import { TTNhanHangModule } from './tt-nhan-hang/tt-nhan-hang.module';
import { MaGiamModule } from './ma-giam/ma-giam.module';
import { DonHangModule } from './don-hang/don-hang.module';
import { DanhGiaModule } from './danh-gia/danh-gia.module';
import { PhiVanChuyenModule } from './phi-van-chuyen/phi-van-chuyen.module';
import { DiaChiModule } from './dia-chi/dia-chi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    NguoiDungModule,
    XacThucModule,
    UtilModule,
    PhiVanChuyenModule,
    TheLoaiModule,
    SachModule,
    KhuyenMaiModule,
    GioHangModule,
    TTNhanHangModule,
    MaGiamModule,
    DonHangModule,
    DanhGiaModule,
    DiaChiModule,
  ],
})
export class AppModule {}
