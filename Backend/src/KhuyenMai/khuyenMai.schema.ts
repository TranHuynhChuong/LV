import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KhuyenMaiDocument = KhuyenMai & Document;
export type ChiTietKhuyenMaiDocument = ChiTietKhuyenMai & Document;

@Schema()
export class LichSuThaoTacKM {
  @Prop({ type: String })
  thaoTac: string;

  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}
export const LichSuThaoTacKMSchema =
  SchemaFactory.createForClass(LichSuThaoTacKM);

@Schema()
export class KhuyenMai {
  @Prop({ type: String, required: true, unique: true, maxlength: 7 })
  KM_id: string;

  @Prop({ type: String, maxlength: 120 })
  KM_ten: string;

  @Prop({ type: Date, required: true })
  KM_batDau: Date;

  @Prop({ type: Date, required: true })
  KM_ketThuc: Date;

  @Prop({ type: Boolean, required: true, default: false })
  KM_daXoa: boolean;

  @Prop({ type: [LichSuThaoTacKMSchema] })
  lichSuThaoTac: LichSuThaoTacKM[];
}

export const KhuyenMaiSchema = SchemaFactory.createForClass(KhuyenMai);

@Schema()
export class ChiTietKhuyenMai {
  @Prop({ type: String, required: true })
  KM_id: string;

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
