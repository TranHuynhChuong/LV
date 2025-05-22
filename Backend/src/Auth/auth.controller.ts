import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

import { AuthGuard } from './auth.guard';
import { Roles } from './auth.roles.decorator';

@Controller('api/auth') // Đường dẫn cho controller
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() newCustomer: any) {
    try {
      await this.authService.register(newCustomer);
      return;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  @Post('send-otp')
  async checkEmail(
    @Body() { email, isNew }: { email: string; isNew?: boolean }
  ) {
    try {
      const otp = await this.authService.sendOtp(isNew ?? true, email);
      return otp;
    } catch (error) {
      console.error('Error during send-otp:', error);
      throw error;
    }
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string }
  ): Promise<any> {
    try {
      return await this.authService.loginCustomer(email, pass);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  @Post('login-staff')
  async loginStaff(
    @Body() { code, pass }: { code: string; pass: string }
  ): Promise<any> {
    try {
      return await this.authService.loginStaff(code, pass);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return res.send({ message: 'Đăng xuất thành công' });
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'customer')
  test() {
    return 'test';
  }
}
