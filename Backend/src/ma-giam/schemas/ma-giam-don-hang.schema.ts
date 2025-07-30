import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MaGiamDonHangDocument = MaGiamDonHang & Document;

/**
 * Schema đại diện cho mối quan hệ giữa đơn hàng và mã giảm giá đã được áp dụng.
 */
@Schema()
export class MaGiamDonHang {
  /**
   * ID của đơn hàng sử dụng mã giảm giá.
   */
  @Prop({ type: String, required: true })
  DH_id: string;

  /**
   * ID của mã giảm giá được áp dụng cho đơn hàng.
   */
  @Prop({ type: String, required: true })
  MG_id: string;
}
export const MaGiamDonHangSchema = SchemaFactory.createForClass(MaGiamDonHang);
MaGiamDonHangSchema.index({ DH_id: 1, MG_id: 1 }, { unique: true });
MaGiamDonHangSchema.index({ DH_id: 1 });
MaGiamDonHangSchema.index({ MG_id: 1 });
