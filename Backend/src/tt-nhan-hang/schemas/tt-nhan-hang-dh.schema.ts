import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TTNhanHangDHDocument = TTNhanHangDH & Document;

@Schema()
export class TTNhanHangDH {
  /**
   * Mã đơn hàng.
   */
  @Prop({ type: String, unique: true, required: true })
  DH_id: string;

  /**
   * Họ và tên người nhận hàng.
   */
  @Prop({ type: String, required: true })
  NH_hoTen: string;

  /**
   * Số điện thoại người nhận hàng.
   */
  @Prop({ type: String, required: true })
  NH_soDienThoai: string;

  /**
   * Ghi chú thêm cho việc nhận hàng.
   */
  @Prop({ type: String })
  NH_ghiChu: string;

  /**
   * Mã tỉnh/thành phố.
   */
  @Prop({ type: Number, required: true })
  T_id: number;

  /**
   * Mã xã/phường.
   */
  @Prop({ type: Number, required: true })
  X_id: number;
}

export const TTNhanHangDHSchema = SchemaFactory.createForClass(TTNhanHangDH);
TTNhanHangDHSchema.index({ T_id: 1 });
