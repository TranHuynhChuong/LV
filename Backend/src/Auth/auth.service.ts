import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
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

    try {
      const newCustomer = {
        KH_hoTen: name,
        KH_email: email,
        KH_matKhau: password,
      };
      return await this.CustomersService.create(newCustomer);
    } catch (error) {
      this.logger.error(
        `Lỗi đăng ký khách hàng: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        'Đăng ký thất bại, vui lòng thử lại sau'
      );
    }
  }

  async changeEmail(email: string, newEmail: string, otp: string) {
    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');
    }

    try {
      return await this.CustomersService.updateEmail(email, newEmail);
    } catch (error) {
      this.logger.error(
        `Lỗi khi cập nhật email: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Không thể cập nhật email');
    }
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
    try {
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
    } catch (error) {
      this.logger.error(`Lỗi gửi OTP: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Không thể gửi OTP');
    }
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
    let staff: any;

    try {
      const adminCode = this.configService.get('admin.code');
      const adminPass = this.configService.get('admin.pass');

      if (code === adminCode && pass === adminPass) {
        staff = { NV_id: adminCode, NV_vaiTro: 'Admin' };
      } else {
        const result = await this.StaffsService.findById(code);
        if (!result || !result.staff) {
          throw new NotFoundException(
            'Mã nhân viên / Mật khẩu không chính xác'
          );
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
    } catch (error) {
      this.logger.error(
        `Lỗi đăng nhập nhân viên: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async loginCustomer(email: string, pass: string): Promise<{ token: string }> {
    try {
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
    } catch (error) {
      this.logger.error(
        `Lỗi đăng nhập khách hàng: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
