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
import { AuthGuard } from './auth.guard';
import { Response, Request } from 'express'; // Sử dụng Response từ express
import { Roles } from './auth.roles.decorator'; // Import the Roles decorator

interface RequestWithCookies extends Request {
  cookies: { refresh_token?: string }; // Thêm kiểu cho cookies
}

@Controller('api/auth') // Đường dẫn cho controller
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() newCustomer: any, @Res() res: Response) {
    try {
      const existingUser = await this.authService.register(newCustomer);
      return res.status(201).json(existingUser);
    } catch (error) {
      console.error('Error during registration:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }

  @Post('login-customer')
  async loginCustomer(
    @Body() { email, pass }: { email: string; pass: string },
    @Res() res: Response
  ): Promise<any> {
    try {
      const { access_token, userId } = await this.authService.loginCustomer(
        email,
        pass,
        res
      );
      return res
        .status(200)
        .json({ access_token: access_token, userId: userId });
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
      const { access_token, userId } = await this.authService.loginStaff(
        code,
        pass,
        res
      );
      return res
        .status(200)
        .json({ access_token: access_token, userId: userId });
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  @Get('refresh-token')
  async refreshAccessToken(
    @Res() res: Response,
    @Req() req: RequestWithCookies
  ) {
    // Lấy refresh_token từ cookie của request
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token) {
      throw new UnauthorizedException('No Refresh Token');
    }

    try {
      const newAccessToken =
        await this.authService.refreshAccessToken(refresh_token);
      return res.json(newAccessToken);
    } catch (error) {
      console.error('Error during token refresh:', error);
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send({ message: 'Đăng xuất thành công' });
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'customer') // Apply the Roles decorator
  test() {
    return 'test';
  }
}
