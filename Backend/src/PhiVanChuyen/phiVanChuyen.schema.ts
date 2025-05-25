import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhiVanChuyenDocument = PhiVanChuyen & Document;

@Schema({
  timestamps: {
    createdAt: 'PVC_tao',
    updatedAt: 'PVC_capNhat',
  },
})
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

  @Prop({ type: String, required: true })
  NV_id: string;
}

export const PhiVanChuyenSchema = SchemaFactory.createForClass(PhiVanChuyen);
