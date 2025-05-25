import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { KhachHangsService } from '../NguoiDung/KhachHang/khachHang.service';
import { NhanVienService } from '../NguoiDung/NhanVien/nhanVien.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Otp } from './xacThuc.otp.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/Util/email.service';

@Injectable()
export class XacThucService {
  private readonly logger = new Logger(XacThucService.name);

  constructor(
    private readonly KhachHang: KhachHangsService,
    private readonly NhanVien: NhanVienService,
    private readonly EmailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private readonly otp: Model<Otp>
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

    const createdCustomer = await this.KhachHang.create(newCustomer);
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

    const updatedCustomer = await this.KhachHang.updateEmail(email, newEmail);
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
    const isExit = await this.KhachHang.findByEmail(email);
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

    await this.EmailService.sendOtpEmail(email, code);

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

    if (code === adminCode && pass === adminPass) {
      const staff = { NV_id: adminCode, NV_vaiTro: 'Admin' };
      return this.generateToken(staff.NV_id, staff.NV_vaiTro).then((token) => ({
        token,
      }));
    }

    return this.NhanVien.findById(code)
      .then(async (result) => {
        if (pass !== result?.result?.NV_matKhau) {
          throw new UnauthorizedException(
            'Mã nhân viên / Mật khẩu không chính xác'
          );
        }

        const staff = result.result;
        const token = await this.generateToken(staff.NV_id, staff.NV_vaiTro);
        return {
          token,
        };
      })
      .catch(() => {
        throw new UnauthorizedException(
          'Mã nhân viên / Mật khẩu không chính xác'
        );
      });
  }

  async loginCustomer(email: string, pass: string): Promise<{ token: string }> {
    const customer = await this.KhachHang.findByEmail(email);
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
