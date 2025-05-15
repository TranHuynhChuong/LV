import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomersService } from '../Users/Customers/customer.service';
import { CreateCustomerDto } from '../Users/Customers/customers.dto';
import { StaffsService } from '../Users/Staffs/staffs.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private CustomersService: CustomersService,
    private StaffsService: StaffsService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(newCustomer: CreateCustomerDto): Promise<any> {
    return await this.CustomersService.create(newCustomer);
  }

  // Tạo Access Token
  private async generateAccessToken(
    userId: string,
    role: string
  ): Promise<string> {
    const payload = { userId: userId, role };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: '30s', // Access Token hết hạn trong 15 phút
    });
  }

  // Tạo Refresh Token
  private async generateRefreshToken(
    userId: string,
    role: string
  ): Promise<string> {
    const payload = { userId: userId, role };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: '1m', // Refresh Token hết hạn trong 7 ngày
    });
  }

  async loginStaff(
    code: string,
    pass: string,
    res: Response
  ): Promise<{ access_token: string; userId: string; role: string }> {
    const staff: any = await this.StaffsService.findByCode(code);
    if (!staff) {
      throw new NotFoundException('Khách hàng không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(pass, staff.NV_matKhau);
    if (!isPasswordValid) {
      throw new NotFoundException('Mật khẩu không chính xác');
    }

    const access_token = await this.generateAccessToken(staff._id, staff.role);
    const refresh_token = await this.generateRefreshToken(
      staff._id,
      staff.role
    );

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token, userId: staff._id, role: staff.role };
  }

  async loginCustomer(
    email: string,
    pass: string,
    res: Response
  ): Promise<{ access_token: string; userId: string; role: string }> {
    const customer: any = await this.CustomersService.findByEmail(email);
    if (!customer) {
      throw new NotFoundException('Khách hàng không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(pass, customer.KH_matKhau);
    if (!isPasswordValid) {
      throw new NotFoundException('Mật khẩu không chính xác');
    }

    const access_token = await this.generateAccessToken(
      customer._id,
      'customer'
    );
    const refresh_token = await this.generateRefreshToken(
      customer._id,
      'customer'
    );

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token, userId: customer._id, role: 'customer' };
  }

  async refreshAccessToken(
    refresh_token: string
  ): Promise<{ access_token: string }> {
    try {
      const payload: { userId: string; role: string } =
        await this.jwtService.verifyAsync(refresh_token, {
          secret: this.configService.get('auth.jwtSecret'),
        });

      // Tạo lại Access Token từ payload của Refresh Token
      const access_token = await this.jwtService.signAsync(
        { userId: payload.userId, role: payload.role },
        {
          secret: this.configService.get('auth.jwtSecret'),
          expiresIn: '30s',
        }
      );
      return { access_token };
    } catch (err) {
      console.error('Error verifying refresh token:', err);
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }
}
