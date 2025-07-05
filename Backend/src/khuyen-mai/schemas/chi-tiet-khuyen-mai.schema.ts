import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChiTietKhuyenMaiDocument = ChiTietKhuyenMai & Document;

@Schema()
export class ChiTietKhuyenMai {
  @Prop({ type: Number, required: true })
  KM_id: number;

  @Prop({ type: Number, required: true })
  SP_id: number;

  @Prop({ type: Boolean, required: true })
  CTKM_theoTyLe: boolean;

  @Prop({ type: Number, required: true })
  CTKM_giaTri: number;

  @Prop({ type: Boolean, required: true, default: false })
  CTKM_tamNgung: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  CTKM_daXoa: boolean;
}

export const ChiTietKhuyenMaiSchema =
  SchemaFactory.createForClass(ChiTietKhuyenMai);

ChiTietKhuyenMaiSchema.index({ KM_id: 1 });
ChiTietKhuyenMaiSchema.index({
  SP_id: 1,
  CTKM_daXoa: 1,
  CTKM_tamNgung: 1,
  KM_id: 1,
});
