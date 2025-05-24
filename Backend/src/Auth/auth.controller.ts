import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Put,
  Res,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() newCustomer: any) {
    try {
      await this.authService.register(newCustomer);
      return { message: 'Đăng ký thành công' };
    } catch (error) {
      this.logger.error(`Đăng ký thất bại: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put('change-email/:email')
  async updateEmailCustomer(
    @Param('email') email: string,
    @Body() { newEmail, otp }: { newEmail: string; otp: string }
  ) {
    try {
      const updatedCustomer = await this.authService.changeEmail(
        email,
        newEmail,
        otp
      );
      if (!updatedCustomer) {
        throw new BadRequestException('Không thể cập nhật email');
      }
      return { message: 'Cập nhật email thành công', data: updatedCustomer };
    } catch (error) {
      this.logger.error(
        `Cập nhật email thất bại: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Post('send-otp')
  async checkEmail(@Body() { email }: { email: string }) {
    try {
      const otp = await this.authService.sendOtp(email);
      return { message: 'OTP đã được gửi', otp }; // Bạn có thể ẩn `otp` trong production
    } catch (error) {
      this.logger.error(`Gửi OTP thất bại: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string }
  ) {
    try {
      const result = await this.authService.loginCustomer(email, pass);
      return { message: 'Đăng nhập thành công', ...result };
    } catch (error) {
      this.logger.error(
        `Đăng nhập khách hàng thất bại: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Post('login-staff')
  async loginStaff(@Body() { code, pass }: { code: string; pass: string }) {
    try {
      const result = await this.authService.loginStaff(code, pass);
      return { message: 'Đăng nhập nhân viên thành công', ...result };
    } catch (error) {
      this.logger.error(
        `Đăng nhập nhân viên thất bại: ${error.message}`,
        error.stack
      );
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
}
