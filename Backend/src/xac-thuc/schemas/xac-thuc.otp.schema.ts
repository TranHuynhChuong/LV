import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Otp extends Document {
  /**
   * Địa chỉ email của người dùng.
   */
  @Prop({ required: true, unique: true })
  email: string;

  /**
   * Mã xác thực hoặc mã OTP được gửi tới email.
   */
  @Prop({ required: true })
  code: string;

  /**
   * Thời điểm hết hạn của mã xác thực.
   * Trường này được đánh chỉ mục để MongoDB tự động xóa document khi hết hạn.
   * `expireAfterSeconds: 0` nghĩa là document sẽ bị xóa ngay khi đến thời điểm `expiresAt`.
   */
  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
