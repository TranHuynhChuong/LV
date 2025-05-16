import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  sendOtpEmail(to: string, otpCode: string): void {
    const subject = 'Mã xác thực OTP của bạn';
    const html = `
      <h3>Xác thực tài khoản</h3>
      <p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>
      <p>Mã có hiệu lực trong 15 phút.</p>
    `;

    console.log(
      this.configService.get<string>('email.user'),
      this.configService.get<string>('email.pass')
    );
    this.transporter
      .sendMail({
        from: this.configService.get<string>('email.user'),
        to,
        subject,
        html,
        text: `Mã OTP của bạn là: ${otpCode}`,
      })
      .catch((error) => {
        console.error('Error sending OTP email:', error);
      });
  }

  sendOrderConfirmation(to: string, orderId: string, total: number): void {
    const subject = 'Xác nhận đơn hàng';
    const html = `
      <h3>Đơn hàng của bạn đã được xác nhận</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Tổng tiền: <strong>${total.toLocaleString()}đ</strong></p>
      <p>Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.</p>
    `;

    this.transporter
      .sendMail({
        from: this.configService.get<string>('email.user'),
        to,
        subject,
        html,
        text: `Đơn hàng ${orderId} của bạn đã được xác nhận. Tổng tiền: ${total}đ`,
      })
      .catch((error) => {
        console.error('Error sending order confirmation email:', error);
      });
  }

  sendShippingNotification(
    to: string,
    orderId: string,
    trackingNumber: string
  ): void {
    const subject = 'Đơn hàng đã được giao';
    const html = `
      <h3>Đơn hàng đang trên đường đến bạn</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Mã vận đơn: <strong>${trackingNumber}</strong></p>
      <p>Vui lòng kiểm tra trạng thái giao hàng trên hệ thống của đơn vị vận chuyển.</p>
    `;

    this.transporter
      .sendMail({
        from: this.configService.get<string>('email.user'),
        to,
        subject,
        html,
        text: `Đơn hàng ${orderId} đã được gửi. Mã vận đơn: ${trackingNumber}`,
      })
      .catch((error) => {
        console.error('Error sending shipping notification email:', error);
      });
  }
}
