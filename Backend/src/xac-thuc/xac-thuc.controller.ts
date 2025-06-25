import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { XacThucService } from './xac-thuc.service';

@Controller('api/auth')
export class XacThucController {
  constructor(private readonly XacThucService: XacThucService) {}

  @Post('register')
  async register(@Body() newCustomer: any): Promise<any> {
    return await this.XacThucService.register(newCustomer);
  }

  @Put('change-email/:id')
  async updateEmailCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() { newEmail, otp }: { newEmail: string; otp: string }
  ) {
    return this.XacThucService.changeEmail(id, newEmail, otp);
  }

  @Put('change-password/:id')
  async updatePasswordCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() { newPassword, otp }: { newPassword: string; otp: string }
  ) {
    return this.XacThucService.changePassword(id, newPassword, otp);
  }

  @Post('send-otp')
  async checkEmail(
    @Body() { email, isNew }: { email: string; isNew: boolean }
  ) {
    return await this.XacThucService.sendOtp(email, isNew);
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string }
  ) {
    return await this.XacThucService.loginCustomer(email, pass);
  }

  @Post('login-staff')
  async loginStaff(@Body() { code, pass }: { code: string; pass: string }) {
    return await this.XacThucService.loginStaff(code, pass);
  }
}
