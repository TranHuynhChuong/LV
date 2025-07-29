import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChiTietKhuyenMaiDocument = ChiTietKhuyenMai & Document;

@Schema()
export class ChiTietKhuyenMai {
  @Prop({ type: Number, required: true })
  KM_id: number;

  @Prop({ type: Number, required: true })
  S_id: number;

  @Prop({ type: Boolean, required: true })
  CTKM_theoTyLe: boolean;

  @Prop({ type: Number, required: true })
  CTKM_giaTri: number;

  @Prop({ type: Number, required: true })
  CTKM_giaSauGiam: number;

  @Prop({ type: Boolean, required: true, default: false })
  CTKM_tamNgung: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  CTKM_daXoa: boolean;
}

export const ChiTietKhuyenMaiSchema =
  SchemaFactory.createForClass(ChiTietKhuyenMai);

ChiTietKhuyenMaiSchema.index({ KM_id: 1 });
ChiTietKhuyenMaiSchema.index({
  S_id: 1,
  CTKM_daXoa: 1,
  CTKM_tamNgung: 1,
  KM_id: 1,
});
