import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { KhachHangService } from '../nguoi-dung/khach-hang/khach-hang.service';
import { NhanVienUtilService } from '../nguoi-dung/nhan-vien/nhan-vien.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Otp } from './schemas/xac-thuc.otp.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/Util/email.service';

@Injectable()
export class XacThucService {
  constructor(
    private readonly KhachHangService: KhachHangService,
    private readonly NhanVienService: NhanVienUtilService,
    private readonly EmailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private readonly otp: Model<Otp>
  ) {}

  async register(data: any): Promise<any> {
    const { otp, name, email, password } = data;

    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new BadRequestException();
    }

    const newCustomer = {
      KH_hoTen: name,
      KH_email: email,
      KH_matKhau: password,
    };

    const createdCustomer = await this.KhachHangService.create(newCustomer);
    if (!createdCustomer) {
      throw new BadRequestException();
    }
    await this.otp.deleteOne({ email });
    return createdCustomer;
  }

  async changeEmail(id: number, newEmail: string, otp: string) {
    const verifyOtp = await this.verifyOtp(newEmail, otp);
    if (!verifyOtp) {
      throw new BadRequestException();
    }

    const updatedCustomer = await this.KhachHangService.updateEmail(
      id,
      newEmail
    );
    if (!updatedCustomer) {
      throw new BadRequestException();
    }
    await this.otp.deleteOne({ id });
    return updatedCustomer;
  }

  async changePassword(id: number, newPass: string, otp: string) {
    const verifyOtp = await this.verifyOtp(id.toString(), otp);
    if (!verifyOtp) {
      throw new ConflictException();
    }

    const updatedCustomer = await this.KhachHangService.update(id, {
      KH_matKhau: newPass,
    });
    if (!updatedCustomer) {
      throw new BadRequestException();
    }
    await this.otp.deleteOne({ email: id.toString() });
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
    } catch {
      return false;
    }
  }

  async sendOtp(email: string, isNew: boolean) {
    const isExit = await this.KhachHangService.findByEmail(email);
    if (isExit && isNew) {
      throw new ConflictException();
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

  private async generateToken(userId: string, role: number): Promise<string> {
    return this.jwtService.signAsync(
      { userId, role },
      {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: '1d',
      }
    );
  }

  async loginStaff(code: string, pass: string): Promise<{ token: string }> {
    const adminCode = this.configService.get('admin.code');
    const adminPass = this.configService.get('admin.pass');

    if (code === adminCode && pass === adminPass) {
      const staff = { NV_id: adminCode, NV_vaiTro: 1 };
      return this.generateToken(staff.NV_id, staff.NV_vaiTro).then((token) => ({
        token,
      }));
    }

    return this.NhanVienService.findById(code)
      .then(async (result) => {
        if (pass !== result?.NV_matKhau) {
          throw new UnauthorizedException();
        }

        const staff = result;
        const token = await this.generateToken(staff.NV_id, staff.NV_vaiTro);
        return {
          token,
        };
      })
      .catch(() => {
        throw new UnauthorizedException();
      });
  }

  async loginCustomer(email: string, pass: string): Promise<{ token: string }> {
    const customer = await this.KhachHangService.findByEmail(email);
    if (!customer) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(pass, customer.KH_matKhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const token = await this.generateToken(customer.KH_id.toString(), 0);
    return { token };
  }
}
