import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    const email = this.configService.get<string>('USER');
    const pass = this.configService.get<string>('PASS');

    if (!email || !pass) {
      throw new Error('Email configuration (EMAIL and PASS) is missing.');
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: pass,
        },
      });

      if (!transporter) {
        throw new Error(
          'Failed to create transporter: Transporter is undefined.'
        );
      }

      return transporter as nodemailer.Transporter;
    } catch (error) {
      throw new Error(`Failed to create transporter: ${error.message}`);
    }
  }

  sendOtpEmail(to: string, otpCode: string): void {
    const subject = 'Mã xác thực OTP của bạn';
    const html = `
      <h3>Xác thực tài khoản</h3>
      <p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>
      <p>Mã có hiệu lực trong 5 phút.</p>
    `;

    this.transporter
      .sendMail({
        from: this.configService.get<string>('EMAIL'),
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
        from: this.configService.get<string>('EMAIL'),
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
        from: this.configService.get<string>('EMAIL'),
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
