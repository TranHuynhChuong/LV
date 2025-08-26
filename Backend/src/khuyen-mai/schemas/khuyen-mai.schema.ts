import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KhuyenMaiDocument = KhuyenMai & Document;

/**
 * Schema Khuyến mãi
 */
@Schema()
export class KhuyenMai {
  /**
   * Mã định danh khuyến mãi
   */
  @Prop({ type: Number, required: true, unique: true })
  KM_id: number;

  /**
   * Tên khuyến mãi
   */
  @Prop({ type: String, maxlength: 120 })
  KM_ten: string;

  /**
   * Ngày bắt đầu áp dụng khuyến mãi
   */
  @Prop({ type: Date, required: true })
  KM_batDau: Date;

  /**
   * Ngày kết thúc khuyến mãi
   */
  @Prop({ type: Date, required: true })
  KM_ketThuc: Date;
}

export const KhuyenMaiSchema = SchemaFactory.createForClass(KhuyenMai);

KhuyenMaiSchema.index({
  KM_id: 1,
  KM_batDau: 1,
  KM_ketThuc: 1,
});
