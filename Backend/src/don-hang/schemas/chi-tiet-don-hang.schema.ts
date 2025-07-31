import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChiTietDonHangDocument = ChiTietDonHang & Document;

/**
 * Kiểu dữ liệu cho chi tiết đơn hàng
 */
@Schema()
export class ChiTietDonHang {
  /**
   * Mã đơn hàng
   */
  @Prop({ type: String, required: true })
  DH_id: string;

  /**
   * Mã sách (sản phẩm)
   */
  @Prop({ type: Number, required: true })
  S_id: number;

  /**
   * Số lượng sản phẩm trong đơn hàng
   */
  @Prop({ type: Number, required: true })
  CTDH_soLuong: number;

  /**
   * Giá nhập (giá vốn) của sản phẩm  (khi tạo đơn hàng)
   */
  @Prop({ type: Number, required: true })
  CTDH_giaNhap: number;

  /**
   * Giá bán sản phẩm (giá niêm yết) (khi tạo đơn hàng)
   */
  @Prop({ type: Number, required: true })
  CTDH_giaBan: number;

  /**
   * Giá mua thực tế (giá sau khuyến mãi nếu có)
   */
  @Prop({ type: Number, required: true })
  CTDH_giaMua: number;
}

export const ChiTietDonHangSchema =
  SchemaFactory.createForClass(ChiTietDonHang);
ChiTietDonHangSchema.index({ DH_id: 1, S_id: 1 }, { unique: true });
