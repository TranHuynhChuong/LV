import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Dật Lạc" <${this.configService.get<string>('email.user')}>`,
        to,
        subject,
        html,
        text,
      });
    } catch {
      throw new InternalServerErrorException('Không thể gửi email');
    }
  }

  sendOtpEmail(to: string, otpCode: string) {
    const subject = 'Mã xác thực OTP của bạn';
    const html = `
      <h3>Xác thực tài khoản</h3>
      <p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>
      <p>Mã có hiệu lực trong 15 phút.</p>
    `;
    const text = `Mã OTP của bạn là: ${otpCode}`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }

  sendOrderCreatetion(to: string, orderId: string) {
    const subject = 'Đơn hàng được tạo thành công';
    const html = `
      <h3>Đơn hàng của bạn đã được tạo thành công</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.</p>
    `;
    const text = `Đơn hàng ${orderId} đã được tạo`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }

  sendOrderConfirmCancel(to: string, orderId: string) {
    const subject = 'Yêu cầu hủy đơn đã được xác nhận';
    const html = `
      <h3>Đơn hàng của bạn đã được xác nhận hủy</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
    `;
    const text = `Đơn hàng ${orderId} đã được hủy`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }

  sendShippingNotification(to: string, orderId: string) {
    const subject = 'Đơn hàng đã được giao';
    const html = `
      <h3>Đơn hàng đang trên đường đến bạn</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Vui lòng kiểm tra trạng thái giao hàng trên hệ thống.</p>
    `;
    const text = `Đơn hàng ${orderId} đã được giao thành công`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }
}
