import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

import { AuthGuard } from './auth.guard';
import { Roles } from './auth.roles.decorator';

interface RequestWithCookies extends Request {
  cookies: { token?: string }; // Thêm kiểu cho cookies
}

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
      throw new UnauthorizedException('Registration failed');
    }
  }

  @Post('send-otp')
  async checkEmail(@Body() { email }: { email: string }) {
    try {
      const otp = await this.authService.sendOtp(email);
      return otp;
    } catch (error) {
      console.error('Error during send-otp:', error);
      throw new Error(error);
    }
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string },
    @Res() res: Response
  ): Promise<any> {
    try {
      const { userId } = await this.authService.loginCustomer(email, pass, res);
      return res.status(200).json({ userId: userId });
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  @Post('login-staff')
  async loginStaff(
    @Body() { code, pass }: { code: string; pass: string },
    @Res() res: Response
  ): Promise<any> {
    try {
      const { userId, role } = await this.authService.loginStaff(
        code,
        pass,
        res
      );
      return res.status(200).json({ userId: userId, role: role });
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  @Get('check-token')
  async checkToken(@Res() res: Response, @Req() req: RequestWithCookies) {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedException('No Token');
    }

    try {
      await this.authService.checkToken(token);
      return res.json({ valid: true });
    } catch (error) {
      // Clear cookie khi token không hợp lệ hoặc hết hạn
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Invalid or expired token');
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
