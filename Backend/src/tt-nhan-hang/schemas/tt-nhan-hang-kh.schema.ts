import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TTNhanHangKHDocument = TTNhanHangKH & Document;

@Schema()
export class TTNhanHangKH {
  /**
   * ID thông tin nhận hàng.
   */
  @Prop({ type: Number })
  NH_id: number;

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

  /**
   * Mã khách hàng.
   */
  @Prop({ type: Number, required: true })
  KH_id: number;

  /**
   * Cờ đánh dấu địa chỉ nhận hàng mặc định.
   */
  @Prop({ type: Boolean, default: false })
  NH_macDinh: boolean;
}

export const TTNhanHangKHSchema = SchemaFactory.createForClass(TTNhanHangKH);
TTNhanHangKHSchema.index({ NH_id: 1, KH_id: 1 }, { unique: true });
