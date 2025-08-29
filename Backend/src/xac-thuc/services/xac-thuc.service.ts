import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { KhachHangService } from '../../nguoi-dung/khach-hang/services/khach-hang.service';
import { NhanVienUtilService } from '../../nguoi-dung/nhan-vien/services/nhan-vien.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Otp } from '../schemas/xac-thuc.otp.schema';
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

  /**
   * Đăng ký tài khoản khách hàng mới.
   *
   * Phương thức này sẽ kiểm tra dữ liệu đầu vào, gửi mã OTP nếu cần,
   * lưu thông tin khách hàng vào cơ sở dữ liệu, và trả về thông tin đã đăng ký.
   *
   * @param data Thông tin khách hàng cần đăng ký (ví dụ: họ tên, email, mật khẩu...).
   * @returns Thông tin khách hàng đã được tạo hoặc lỗi nếu đăng ký thất bại.
   */
  async register(data: any): Promise<any> {
    const { otp, name, email, password } = data;
    try {
      await this.KhachHangService.findByEmail(email);
      throw new ConflictException('Email đã được đăng ký');
    } catch {
      // Email not found, proceed with registration
    }
    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new UnprocessableEntityException('Mã OTP không chính xác');
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

  /**
   * Thay đổi địa chỉ email của khách hàng sau khi xác thực mã OTP.
   *
   * Phương thức sẽ kiểm tra tính hợp lệ của mã OTP tương ứng với email mới.
   * Nếu hợp lệ, địa chỉ email của khách hàng sẽ được cập nhật trong cơ sở dữ liệu.
   *
   * @param id ID của khách hàng cần thay đổi email.
   * @param newEmail Địa chỉ email mới cần cập nhật.
   * @param otp Mã OTP được gửi đến email mới để xác thực.
   * @returns Thông tin khách hàng đã được cập nhật hoặc thông báo lỗi nếu thất bại.
   * @throws NotFoundException nếu không tìm thấy khách hàng.
   * @throws BadRequestException nếu mã OTP không hợp lệ hoặc đã hết hạn.
   */
  async changeEmail(id: number, newEmail: string, otp: string) {
    const verifyOtp = await this.verifyOtp(newEmail, otp);
    if (!verifyOtp) {
      throw new UnprocessableEntityException();
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

  /**
   * Thay đổi mật khẩu cho khách hàng sau khi xác thực mã OTP.
   *
   * @param id ID của khách hàng cần thay đổi mật khẩu.
   * @param newPass Mật khẩu mới cần được cập nhật.
   * @param otp Mã OTP được sử dụng để xác thực thay đổi.
   * @returns Thông báo thành công hoặc lỗi nếu thất bại.
   * @throws NotFoundException nếu không tìm thấy khách hàng.
   * @throws BadRequestException nếu mã OTP không hợp lệ hoặc đã hết hạn.
   * @throws InternalServerErrorException nếu xảy ra lỗi khi cập nhật mật khẩu.
   */
  async changePassword(id: number, newPass: string, otp: string) {
    const user = await this.KhachHangService.findById(id);
    if (!user) {
      throw new NotFoundException('Email chưa đăng ký');
    }
    const email = user.email;
    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new UnprocessableEntityException('Mã OTP không chính xác');
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

  /**
   * Đặt lại mật khẩu mới cho khách hàng khi quên mật khẩu.
   *
   * @param email Địa chỉ email của khách hàng yêu cầu đặt lại mật khẩu.
   * @param newPass Mật khẩu mới cần được đặt.
   * @param otp Mã OTP được gửi tới email để xác thực.
   * @returns Thông báo thành công nếu mật khẩu được đặt lại thành công.
   * @throws NotFoundException nếu không tìm thấy khách hàng với email tương ứng.
   * @throws BadRequestException nếu mã OTP không hợp lệ hoặc đã hết hạn.
   * @throws InternalServerErrorException nếu có lỗi trong quá trình cập nhật mật khẩu.
   */
  async forgotPassword(email: string, newPass: string, otp: string) {
    const user = await this.KhachHangService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email chưa đăng ký');
    }
    const id = user.id;
    const verifyOtp = await this.verifyOtp(email, otp);
    if (!verifyOtp) {
      throw new UnprocessableEntityException('Mã OTP không chính xác');
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

  /**
   * Xác thực mã OTP dựa trên email và mã được cung cấp.
   *
   * @param email Địa chỉ email của người dùng nhận mã OTP.
   * @param code Mã OTP cần xác thực.
   * @returns `true` nếu mã OTP hợp lệ và còn hiệu lực, ngược lại trả về `false`.
   * @throws InternalServerErrorException nếu có lỗi xảy ra trong quá trình xác thực.
   */
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

  /**
   * Gửi mã OTP đến email của người dùng.
   *
   * @param email Địa chỉ email người nhận OTP.
   * @param isNew Cờ xác định đây là email mới (đăng ký) hay đã tồn tại (phục hồi tài khoản, xác thực).
   * @returns Trả về thông báo đã gửi OTP thành công.
   * @throws BadRequestException nếu điều kiện `isNew` không đúng với trạng thái tồn tại của email trong hệ thống.
   * @throws InternalServerErrorException nếu có lỗi xảy ra trong quá trình gửi OTP.
   */
  async sendOtp(email: string, isNew: boolean) {
    const isExist = await this.KhachHangService.findByEmail(email);
    if (isExist && isNew) {
      throw new NotFoundException('Email đã đăng ký');
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

  /**
   * Gửi mã OTP đến địa chỉ email của người dùng dựa trên ID người dùng.

   *
   * @param id Mã định danh của người dùng (user ID).
   * @returns Trả về thông báo đã gửi OTP thành công.
   * @throws NotFoundException nếu không tìm thấy người dùng với `id` đã cung cấp.
   * @throws InternalServerErrorException nếu có lỗi xảy ra trong quá trình gửi OTP.
   */
  async sendOtpToUser(id: number) {
    const user = await this.KhachHangService.findById(id);
    if (!user) {
      throw new NotFoundException('Email chưa đăng ký');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const email = user.email;
    await this.otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );
    this.EmailService.sendOtpEmail(email, code);
    return code;
  }

  /**
   * Tạo mã JWT (JSON Web Token) cho người dùng.
   *
   * @private
   * @param userId Mã định danh duy nhất của người dùng (thường là `_id` hoặc `id`).
   * @param role Vai trò (role) của người dùng, thường được dùng để phân quyền (ví dụ: 0 - khách hàng, 1 - nhân viên, ...).
   * @returns Trả về chuỗi token JWT đã được ký.
   * @throws InternalServerErrorException nếu có lỗi xảy ra trong quá trình tạo token.
   */
  private async generateToken(userId: string, role: number): Promise<string> {
    return this.jwtService.signAsync(
      { userId, role },
      {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: '1d',
      }
    );
  }

  /**
   * Xác thực đăng nhập cho nhân viên hệ thống.
   *
   * @param code Mã định danh nhân viên (duy nhất cho từng nhân viên).
   * @param pass Mật khẩu đăng nhập của nhân viên.
   * @returns Trả về một đối tượng chứa token JWT nếu đăng nhập thành công.
   * @throws UnauthorizedException nếu thông tin đăng nhập không chính xác.
   * @throws InternalServerErrorException nếu xảy ra lỗi trong quá trình xử lý.
   */
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

  /**
   * Đăng nhập khách hàng bằng email và mật khẩu.
   *
   * @param email - Email của khách hàng.
   * @param pass - Mật khẩu của khách hàng.
   * @returns JWT token nếu đăng nhập thành công.
   * @throws BadRequestException nếu thông tin đăng nhập không hợp lệ.
   */
  async loginCustomer(email: string, pass: string): Promise<{ token: string }> {
    const customer = await this.KhachHangService.findByEmail(email);
    if (!customer) {
      throw new UnauthorizedException();
    }
    const isPasswordValid = await bcrypt.compare(pass, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const token = await this.generateToken(customer.id.toString(), 0);
    return { token };
  }
}
