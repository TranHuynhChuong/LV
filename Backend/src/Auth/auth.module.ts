import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { UtilModule } from 'src/Util/util.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './auth.otp.schema';

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
    forwardRef(() => UsersModule),
    UtilModule,
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
