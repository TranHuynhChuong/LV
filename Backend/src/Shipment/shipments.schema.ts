import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VAN_CHUYENDocument = VAN_CHUYEN & Document;

@Schema({
  timestamps: {
    createdAt: 'VC_tao',
    updatedAt: 'VC_capNhat',
  },
})
export class VAN_CHUYEN {
  @Prop({ type: Number, required: true })
  VC_id: number;

  @Prop({ type: Number, required: true })
  VC_phi: number;

  @Prop({ type: Number, required: true })
  VC_nkl: number;

  @Prop({ type: Number, required: true })
  VC_phuPhi: number;

  @Prop({ type: Number, required: true })
  VC_dvgtkl: number;

  @Prop({ type: Boolean, default: false })
  VC_daoXoa: boolean;

  @Prop({ type: String, required: true })
  KH_email: string;

  @Prop({ type: String, required: true })
  NV_id: string;
}

export const VAN_CHUYENSchema = SchemaFactory.createForClass(VAN_CHUYEN);
