import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() newCustomer: any) {
    await this.authService.register(newCustomer);
    return { message: 'Đăng ký thành công' };
  }

  @Put('change-email/:email')
  async updateEmailCustomer(
    @Param('email') email: string,
    @Body() { newEmail, otp }: { newEmail: string; otp: string }
  ) {
    await this.authService.changeEmail(email, newEmail, otp);
    return { message: 'Cập nhật email thành công' };
  }

  @Post('send-otp')
  async checkEmail(@Body() { email }: { email: string }) {
    const otp = await this.authService.sendOtp(email);
    return { message: 'OTP đã được gửi', otp };
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string }
  ) {
    await this.authService.loginCustomer(email, pass);
    return { message: 'Đăng nhập thành công' };
  }

  @Post('login-staff')
  async loginStaff(@Body() { code, pass }: { code: string; pass: string }) {
    await this.authService.loginStaff(code, pass);
    return { message: 'Đăng nhập nhân viên thành công' };
  }
}
