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

  /**
   * Gửi email đến một người nhận cụ thể.
   *
   * @param to - Địa chỉ email người nhận.
   * @param subject - Tiêu đề email.
   * @param html - Nội dung email ở định dạng HTML.
   * @param text - Nội dung email ở định dạng thuần văn bản (plain text).
   * @throws InternalServerErrorException nếu quá trình gửi email gặp lỗi.
   */
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

  /**
   * Gửi email chứa mã OTP đến email người dùng.
   *
   * @param to - Địa chỉ email người nhận OTP.
   * @param otpCode - Mã OTP sẽ được gửi.
   * @throws InternalServerErrorException nếu quá trình gửi email gặp lỗi.
   */
  sendOtpEmail(to: string, otpCode: string) {
    const subject = 'Xác thực tài khoản - Mã OTP của bạn';
    const html = `
      <h3>Xác thực tài khoản</h3>
      <p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>
      <p>Mã có hiệu lực trong 15 phút.</p>
      <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
    `;
    const text = `Mã OTP của bạn là: ${otpCode}`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }

  /**
   * Gửi email thông báo tạo đơn hàng thành công đến khách hàng.
   *
   * @param to - Địa chỉ email người nhận.
   * @param orderId - Mã đơn hàng vừa được tạo.
   * @throws InternalServerErrorException nếu xảy ra lỗi khi gửi email.
   */
  sendOrderCreatetion(to: string, orderId: string) {
    const subject = 'Đơn hàng được tạo thành công';
    const html = `
      <h3>Đơn hàng của bạn đã được tạo thành công</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.</p>
    `;
    const text = `Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: ${orderId}`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }

  /**
   * Gửi email xác nhận huỷ đơn hàng đến khách hàng.
   *
   * @param to - Địa chỉ email người nhận.
   * @param orderId - Mã đơn hàng đã bị huỷ.
   * @throws InternalServerErrorException nếu gửi email thất bại.
   */
  sendOrderConfirmCancel(to: string, orderId: string) {
    const subject =
      'Yêu cầu hủy đơn đã được xác nhận. Nếu bạn không yêu cầu điều này, vui lòng liên hệ với chúng tôi.';
    const html = `
      <h3>Đơn hàng của bạn đã được xác nhận hủy</h3>
      <p>Chúng tôi xác nhận rằng đơn hàng <strong>${orderId}</strong> của bạn đã được <span style="color: red;">huỷ thành công</span>.</p>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Trân trọng,</p>
    `;
    const text = `Đơn hàng ${orderId} đã được hủy`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }

  /**
   * Gửi email thông báo đơn hàng đã được giao.
   *
   * @param to - Địa chỉ email người nhận.
   * @param orderId - Mã đơn hàng đã được giao.
   * @throws InternalServerErrorException nếu gửi email thất bại.
   */
  sendShippingNotification(to: string, orderId: string) {
    const subject = 'Đơn hàng đã được giao';
    const html = `
      <h3>Đơn hàng được giao đến bạn</h3>
      <p>Mã đơn hàng: <strong>${orderId}</strong></p>
      <p>Vui lòng kiểm tra trạng thái giao hàng trên hệ thống.</p>
    `;
    const text = `Đơn hàng ${orderId} đã được giao thành công`;
    this.sendEmail(to, subject, html, text).catch((err) => {
      console.error(`Gửi email thất bại: ${err.message}`);
    });
  }
}
