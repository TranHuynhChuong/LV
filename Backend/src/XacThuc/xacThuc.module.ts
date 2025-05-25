import { Global, Module } from '@nestjs/common';
import { AuthService } from './xacThuc.service';
import { AuthController } from './xacThuc.controller';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './xacThuc.guard';
import { UtilModule } from 'src/Util/util.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './xacThuc.otp.schema';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: { expiresIn: '6h' },
      }),
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    UtilModule,
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
