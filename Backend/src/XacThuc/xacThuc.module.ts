import { Global, Module } from '@nestjs/common';
import { XacThucService } from './xacThuc.service';
import { XacThucController } from './xacThuc.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { XacThucGuard } from './xacThuc.guard';
import { UtilModule } from 'src/Util/util.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './xacThuc.otp.schema';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    UtilModule,
    NguoiDungModule,
  ],
  providers: [XacThucService, XacThucGuard],
  controllers: [XacThucController],
  exports: [XacThucService, XacThucGuard, JwtModule],
})
export class XacThucModule {}
