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

  /**
   * Đăng ký tài khoản khách hàng mới.
   * @param newCustomer Dữ liệu khách hàng cần đăng ký.
   * @returns Thông tin khách hàng đã đăng ký hoặc lỗi nếu không thành công.
   */
  @Post('register')
  async register(@Body() newCustomer: any): Promise<any> {
    return await this.XacThucService.register(newCustomer);
  }

  /**
   * Cập nhật địa chỉ email cho khách hàng bằng mã OTP.
   * @param id Mã định danh của khách hàng.
   * @param newEmail Email mới cần cập nhật.
   * @param otp Mã xác thực OTP gửi tới email mới.
   * @returns Kết quả cập nhật email.
   */
  @Put('change-email/:id')
  async updateEmailCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() { newEmail, otp }: { newEmail: string; otp: string }
  ) {
    return this.XacThucService.changeEmail(id, newEmail, otp);
  }

  /**
   * Đổi mật khẩu cho khách hàng thông qua OTP.
   * @param id Mã định danh của khách hàng.
   * @param newPassword Mật khẩu mới.
   * @param otp Mã xác thực OTP.
   * @returns Kết quả thay đổi mật khẩu.
   */
  @Put('change-password/:id')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() { newPassword, otp }: { newPassword: string; otp: string }
  ) {
    return this.XacThucService.changePassword(id, newPassword, otp);
  }

  /**
   * Quên mật khẩu – thay đổi mật khẩu qua email và OTP.
   * @param email Email đăng ký tài khoản.
   * @param newPassword Mật khẩu mới.
   * @param otp Mã xác thực OTP gửi tới email.
   * @returns Kết quả đặt lại mật khẩu.
   */
  @Put('forgot-password')
  async forgotPassword(
    @Body()
    {
      email,
      newPassword,
      otp,
    }: {
      email: string;
      newPassword: string;
      otp: string;
    }
  ) {
    return this.XacThucService.forgotPassword(email, newPassword, otp);
  }

  /**
   * Gửi mã OTP đến email của người dùng theo ID.
   * Dùng khi người dùng đã đăng nhập và có ID.
   * @param id Mã định danh của người dùng.
   * @returns Kết quả gửi OTP.
   */
  @Post(':id/send-otp')
  async checkEmailUser(@Param('id', ParseIntPipe) id: number) {
    return await this.XacThucService.sendOtpToUser(id);
  }

  /**
   * Gửi mã OTP đến email người dùng theo địa chỉ email.
   * Dùng cho đăng ký mới hoặc xác thực quên mật khẩu.
   * @param email Địa chỉ email của người dùng.
   * @param isNew `true` nếu là tạo mới tài khoản, `false` nếu là xác thực khác.
   * @returns Kết quả gửi OTP.
   */
  @Post('send-otp')
  async checkEmail(
    @Body() { email, isNew }: { email: string; isNew: boolean }
  ) {
    return await this.XacThucService.sendOtp(email, isNew);
  }

  /**
   * Đăng nhập bằng email và mật khẩu dành cho khách hàng.
   * @param email Email của khách hàng.
   * @param pass Mật khẩu đã đăng ký.
   * @returns Token xác thực và thông tin tài khoản nếu hợp lệ.
   */
  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string }
  ) {
    return await this.XacThucService.loginCustomer(email, pass);
  }

  /**
   * Đăng nhập bằng mã nhân viên và mật khẩu dành cho nhân viên.
   * @param code Mã đăng nhập của nhân viên.
   * @param pass Mật khẩu.
   * @returns Token xác thực và thông tin nhân viên nếu hợp lệ.
   */
  @Post('login-staff')
  async loginStaff(@Body() { code, pass }: { code: string; pass: string }) {
    return await this.XacThucService.loginStaff(code, pass);
  }
}
