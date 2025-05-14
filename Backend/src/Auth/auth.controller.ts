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
import { Response, Request } from 'express';

interface RequestWithCookies extends Request {
  cookies: { refresh_token?: string };
}

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login-customer')
  async signIn(
    @Body() signInDto: { username: string; password: string },
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.signIn(
        signInDto.username,
        signInDto.password,
        res
      );
      return res.json(result);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Username or password is incorrect');
    }
  }

  @Post('refresh-token')
  async refreshAccessToken(
    @Res() res: Response,
    @Req() req: RequestWithCookies
  ) {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      throw new UnauthorizedException('No Refresh Token');
    }

    try {
      const newAccessToken =
        await this.authService.refreshAccessToken(refresh_token);

      return res.json(newAccessToken);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send({ message: 'Đăng xuất thành công' });
  }
}
