import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.jwtSecret'),
      });
      request['user'] = payload;

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        'roles',
        [context.getHandler(), context.getClass()]
      );

      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập tài nguyên này'
        );
      }

      return true;
    } catch (error) {
      this.logger.warn(`Xác thực token thất bại: ${error.message}`);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    let authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader) return null;

    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }

    const [type, token] = authHeader.split(' ');

    if (type?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
