import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    let payload: { [key: string]: any };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('auth.jwtSecret'),
      });
      request['user'] = payload;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid token');
    }

    // Kiểm tra quyền người dùng nếu cần
    const requiredRoles = this.getRequiredRoles(context); // Lấy các quyền yêu cầu từ decorator
    if (requiredRoles && !requiredRoles.includes(payload.role)) {
      throw new ForbiddenException('You do not have the required role');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    let authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader) return null;

    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }

    // Kiểm tra format "Bearer token"
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return typeof parts[1] === 'string' ? parts[1] : null;
    }

    return null;
  }

  private getRequiredRoles(context: ExecutionContext): string[] | undefined {
    const handler = context.getHandler();
    return Reflect.getMetadata('roles', handler) as string[] | undefined; // Lấy tất cả các quyền yêu cầu từ decorator
  }
}
