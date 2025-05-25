import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhiVanChuyenDocument = PhiVanChuyen & Document;

@Schema({
  timestamps: {
    createdAt: 'VC_tao',
    updatedAt: 'VC_capNhat',
  },
})
export class PhiVanChuyen {
  @Prop({ type: Number, required: true })
  VC_phi: number;

  @Prop({ type: Number, required: true })
  VC_ntl: number;

  @Prop({ type: Number, default: 0 })
  VC_phuPhi: number;

  @Prop({ type: Number, default: 0 })
  VC_dvpp: number;

  @Prop({ type: Boolean, default: false })
  VC_daXoa: boolean;

  @Prop({ type: Number, unique: true })
  T_id: number;

  @Prop({ type: String, required: true })
  NV_id: string;
}

export const PhiVanChuyenSchema = SchemaFactory.createForClass(PhiVanChuyen);
