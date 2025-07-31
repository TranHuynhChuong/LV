import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GioHangDocument = GioHang & Document;

/**
 * Schema đại diện cho một mục giỏ hàng của khách hàng.
 * Mỗi khách hàng chỉ có thể có một bản ghi duy nhất cho một sản phẩm cụ thể.
 */
@Schema()
export class GioHang {
  /**
   * ID của khách hàng sở hữu giỏ hàng
   */
  @Prop({ type: Number, required: true })
  KH_id: number;

  /**
   * ID của sản phẩm có trong giỏ hàng
   */
  @Prop({ type: Number, required: true })
  S_id: number;

  /**
   * Số lượng sản phẩm được thêm vào giỏ hàng
   */
  @Prop({ type: Number, required: true })
  GH_soLuong: number;

  /**
   * Thời gian cập nhật hoặc thêm sản phẩm vào giỏ hàng
   */
  @Prop({ type: Date, required: true })
  GH_thoiGian: Date;
}

export const GioHangSchema = SchemaFactory.createForClass(GioHang);
GioHangSchema.index({ KH_id: 1, S_id: 1 }, { unique: true });
