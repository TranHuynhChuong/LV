import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhiVanChuyenDocument = PhiVanChuyen & Document;

@Schema()
export class LichSuThaoTacPVC {
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

export const LichSuThaoTacPVCSchema =
  SchemaFactory.createForClass(LichSuThaoTacPVC);

@Schema()
export class PhiVanChuyen {
  @Prop({ type: Number, required: true })
  PVC_phi: number;

  @Prop({ type: Number, required: true })
  PVC_ntl: number;

  @Prop({ type: Number, default: 0 })
  PVC_phuPhi: number;

  @Prop({ type: Number, default: 0 })
  PVC_dvpp: number;

  @Prop({ type: Boolean, default: false })
  PVC_daXoa: boolean;

  @Prop({ type: Number, unique: true })
  T_id: number;

  @Prop({ type: [LichSuThaoTacPVCSchema] })
  lichSuThaoTac: LichSuThaoTacPVC[];
}

export const PhiVanChuyenSchema = SchemaFactory.createForClass(PhiVanChuyen);
