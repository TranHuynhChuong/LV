import { PhiVanChuyenModule } from './PhiVanChuyen/phiVanChuyen.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { NguoiDungModule } from './NguoiDung/nguoiDung.module';
import { UtilModule } from './Util/util.module';
import { XacThucModule } from './XacThuc/xacThuc.module';
import { TheLoaiModule } from './TheLoai/theLoai.module';
import { SanPhamModule } from './SanPham/sanPham.module';

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
    SanPhamModule,
  ],
})
export class AppModule {}
