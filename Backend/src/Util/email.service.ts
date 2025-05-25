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
        from: `"ShopNest" <${this.configService.get<string>('email.user')}>`,
        to,
        subject,
        html,
        text,
      });
    } catch {
      throw new InternalServerErrorException('Không thể gửi email');
    }
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    const subject = 'Mã xác thực OTP của bạn';
    const html = `
      <h3>Xác thực tài khoản</h3>
      <p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>
      <p>Mã có hiệu lực trong 15 phút.</p>
    `;
    const text = `Mã OTP của bạn là: ${otpCode}`;
    await this.sendEmail(to, subject, html, text);
  }

  async sendOrderConfirmation(
    to: string,
    orderId: string,
    total: number
  ): Promise<void> {
    const subject = 'Xác nhận đơn hàng';
    const html = `
      <h3>Đơn hàng của bạn đã được xác nhận</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Tổng tiền: <strong>${total.toLocaleString()}đ</strong></p>
      <p>Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.</p>
    `;
    const text = `Đơn hàng ${orderId} đã được xác nhận. Tổng tiền: ${total}đ`;
    await this.sendEmail(to, subject, html, text);
  }

  async sendShippingNotification(
    to: string,
    orderId: string,
    trackingNumber: string
  ): Promise<void> {
    const subject = 'Đơn hàng đã được giao';
    const html = `
      <h3>Đơn hàng đang trên đường đến bạn</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Mã vận đơn: <strong>${trackingNumber}</strong></p>
      <p>Vui lòng kiểm tra trạng thái giao hàng trên hệ thống của đơn vị vận chuyển.</p>
    `;
    const text = `Đơn hàng ${orderId} đã được gửi. Mã vận đơn: ${trackingNumber}`;
    await this.sendEmail(to, subject, html, text);
  }
}
