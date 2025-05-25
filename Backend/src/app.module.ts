import { ShippingFeeModule } from './PhiVanChuyen/phiVanChuyen.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { UsersModule } from './NguoiDung/nguoiDung.module';
import { UtilModule } from './Util/util.module';
import { XacThucModule } from './XacThuc/xacThuc.module';

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
    UsersModule,
    XacThucModule,
    UtilModule,
    ShippingFeeModule,
  ],
})
export class AppModule {}
