import { Injectable, NotFoundException } from '@nestjs/common';
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
      throw new Error('Mã OTP không đúng hoặc hết hạn');
    }
    try {
      const newCustomer = {
        KH_hoTen: name,
        KH_email: email,
        KH_matKhau: password,
      };
      return await this.CustomersService.create(newCustomer);
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyOtp(email: string, code: string) {
    const record = await this.otp.findOne({ email });
    if (!record || record.code !== code || record.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async sendOtp(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // OTP 6 số
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // +15 phút

    await this.otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    this.EmailService.sendOtpEmail(email, code);

    return code;
  }

  // Tạo Token
  private async generateToken(userId: string, role: string): Promise<string> {
    const payload = { userId: userId, role: role };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: '6h',
    });
  }

  async loginStaff(code: string, pass: string): Promise<{ token: string }> {
    let staff: any;

    const adminCode = this.configService.get('admin.code');
    const adminPass = this.configService.get('admin.pass');

    if (code === adminCode && pass === adminPass) {
      staff = { NV_id: adminCode, NV_vaiTro: 'Admin' };
    } else {
      const result = await this.StaffsService.findById(code);
      staff = result.staff;
      if (!result) {
        throw new NotFoundException('Nhân viên không tồn tại');
      }

      if (pass !== staff.NV_matKhau) {
        throw new NotFoundException('Mật khẩu không chính xác');
      }
    }
    const token = await this.generateToken(staff.NV_id, staff.NV_vaiTro);
    return { token: token };
  }

  async loginCustomer(email: string, pass: string): Promise<{ token: string }> {
    const customer = await this.CustomersService.findByEmail(email);
    if (!customer) {
      throw new NotFoundException('Thông tin đăng nhập không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(pass, customer.KH_matKhau);
    if (!isPasswordValid) {
      throw new NotFoundException('Thông tin đăng nhập không chính xác');
    }

    const token = await this.generateToken(customer.KH_email, 'customer');
    return { token: token };
  }
}
