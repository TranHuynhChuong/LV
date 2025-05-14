import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  private async generateTokens(
    userId: string,
    role: string,
    res: Response
  ): Promise<{ access_token: string; userId: string; role: string }> {
    const payload = { sub: userId, role };

    const jwtSecret = this.configService.get<string>('auth.jwtSecret');
    const jwtRefreshSecret = this.configService.get<string>(
      'auth.jwtRefreshSecret'
    );

    const access_token = await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: jwtRefreshSecret,
      expiresIn: '7d',
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token, userId, role };
  }

  async signInCustomer(username: string, pass: string, res: Response) {
    const user = {
      username,
      password: '123456',
      userId: 'cust-1',
      role: 'customer',
    }; // Thay bằng truy vấn từ DB

    if (user.password !== pass) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(user.userId, user.role, res);
  }

  async signInStaff(username: string, pass: string, res: Response) {
    const user = {
      username,
      password: 'adminpass',
      userId: 'staff-1',
      role: 'staff',
    }; // Thay bằng truy vấn từ DB

    if (user.password !== pass) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(user.userId, user.role, res);
  }

  async refreshAccessToken(
    refresh_token: string
  ): Promise<{ access_token: string }> {
    try {
      // Lấy secret từ config
      const jwtSecret = this.configService.get<string>('auth.jwtSecret');
      const jwtRefreshSecret = this.configService.get<string>(
        'auth.jwtRefreshSecret'
      );

      // Xác minh refresh token bằng jwtRefreshSecret
      const payload: { sub: number; username: string } =
        await this.jwtService.verifyAsync(refresh_token, {
          secret: jwtRefreshSecret, // Xác minh với refresh token secret
        });

      // Tạo access token mới
      const access_token = await this.jwtService.signAsync(
        { sub: payload.sub, username: payload.username },
        {
          secret: jwtSecret, // Tạo access token với access token secret
          expiresIn: '15m',
        }
      );

      return { access_token };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token', err);
    }
  }
}
