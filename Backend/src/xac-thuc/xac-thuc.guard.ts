import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class XacThucGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookies(request);

    if (!token) {
      throw new UnauthorizedException('Yêu cầu đăng nhập');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.jwtSecret'),
      });
      request['user'] = payload;

      const requiredRoles = this.reflector.getAllAndOverride<number[]>(
        'roles',
        [context.getHandler(), context.getClass()]
      );

      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('Không có quyền truy cập');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromCookies(request: Request): string | null {
    const cookies: Record<string, string> = request.cookies ?? {};

    return cookies['staff-token'] ?? cookies['customer-token'] ?? null;
  }
}
