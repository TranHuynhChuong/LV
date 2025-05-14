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
      const { access_token } = await this.authService.loginCustomer(
        email,
        pass,
        res
      );
      return res.status(200).json({ access_token });
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'customer') // Apply the Roles decorator
  test() {
    return 'test';
  }
}
