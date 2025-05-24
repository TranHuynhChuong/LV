import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { CustomersService } from '../Users/Customers/customer.service';
import { StaffsService } from '../Users/Staffs/staffs.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Otp } from './auth.otp.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/Util/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private CustomersService: CustomersService,
    private StaffsService: StaffsService,
    private EmailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(Otp.name) private otp: Model<Otp>
  ) {}

  async register(data: any): Promise<any> {
    const { otp, name, email, password } = data;

    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');
    }

    const newCustomer = {
      KH_hoTen: name,
      KH_email: email,
      KH_matKhau: password,
    };

    const createdCustomer = await this.CustomersService.create(newCustomer);
    if (!createdCustomer) {
      throw new BadRequestException('Không thể tạo tài khoản mới');
    }

    return createdCustomer;
  }

  async changeEmail(email: string, newEmail: string, otp: string) {
    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');
    }

    const updatedCustomer = await this.CustomersService.updateEmail(
      email,
      newEmail
    );
    if (!updatedCustomer) {
      throw new BadRequestException('Không thể cập nhật email');
    }
    return updatedCustomer;
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    try {
      const record = await this.otp.findOne({ email });
      return !!(
        record &&
        record.code === code &&
        record.expiresAt > new Date()
      );
    } catch (error) {
      this.logger.error(`Lỗi kiểm tra OTP: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendOtp(email: string) {
    const isExit = await this.CustomersService.findByEmail(email);
    if (isExit) {
      throw new BadRequestException('Email đã được đăng ký tài khoản');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    this.EmailService.sendOtpEmail(email, code);

    return code;
  }

  private async generateToken(userId: string, role: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId, role },
      {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: '6h',
      }
    );
  }

  async loginStaff(code: string, pass: string): Promise<{ token: string }> {
    const adminCode = this.configService.get('admin.code');
    const adminPass = this.configService.get('admin.pass');

    let staff: any;

    if (code === adminCode && pass === adminPass) {
      staff = { NV_id: adminCode, NV_vaiTro: 'Admin' };
    } else {
      const result = await this.StaffsService.findById(code);
      if (!result || !result.staff) {
        throw new NotFoundException('Mã nhân viên / Mật khẩu không chính xác');
      }

      staff = result.staff;

      if (pass !== staff.NV_matKhau) {
        throw new UnauthorizedException(
          'Mã nhân viên / Mật khẩu không chính xác'
        );
      }
    }

    const token = await this.generateToken(staff.NV_id, staff.NV_vaiTro);
    return { token };
  }

  async loginCustomer(email: string, pass: string): Promise<{ token: string }> {
    const customer = await this.CustomersService.findByEmail(email);
    if (!customer) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(pass, customer.KH_matKhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const token = await this.generateToken(customer.KH_email, 'customer');
    return { token };
  }
}
