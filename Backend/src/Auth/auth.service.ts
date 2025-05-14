import { Injectable, NotFoundException } from '@nestjs/common';
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
    const payload = { sub: userId, role };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: '15m', // Access Token hết hạn trong 15 phút
    });
  }

  // Tạo Refresh Token
  private async generateRefreshToken(
    userId: string,
    role: string
  ): Promise<string> {
    const payload = { sub: userId, role };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: '7d', // Refresh Token hết hạn trong 7 ngày
    });
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
    // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // Hết hạn sau 7 ngày
    });

    return { access_token, userId: customer.userId, role: 'customer' };
  }
}
