import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { XacThucService } from './xacThuc.service';

@Controller('api/auth')
export class XacThucController {
  constructor(private readonly authService: XacThucService) {}

  @Post('register')
  async register(@Body() newCustomer: any): Promise<any> {
    return await this.authService.register(newCustomer);
  }

  @Put('change-email/:email')
  async updateEmailCustomer(
    @Param('email') email: string,
    @Body() { newEmail, otp }: { newEmail: string; otp: string }
  ) {
    return this.authService.changeEmail(email, newEmail, otp);
  }

  @Put('change-password/:email')
  async updatePasswordCustomer(
    @Param('email') email: string,
    @Body() { newPassword, otp }: { newPassword: string; otp: string }
  ) {
    return this.authService.changePassword(email, newPassword, otp);
  }

  @Post('send-otp')
  async checkEmail(
    @Body() { email, isNew }: { email: string; isNew: boolean }
  ) {
    return await this.authService.sendOtp(email, isNew);
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string }
  ) {
    return await this.authService.loginCustomer(email, pass);
  }

  @Post('login-staff')
  async loginStaff(@Body() { code, pass }: { code: string; pass: string }) {
    return await this.authService.loginStaff(code, pass);
  }
}
