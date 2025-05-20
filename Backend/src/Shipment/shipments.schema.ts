import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PHI_VAN_CHUYENDocument = PHI_VAN_CHUYEN & Document;

@Schema({
  timestamps: {
    createdAt: 'VC_tao',
    updatedAt: 'VC_capNhat',
  },
})
export class PHI_VAN_CHUYEN {
  @Prop({ type: Number, required: true })
  VC_id: number;

  @Prop({ type: Number, required: true, default: 0 })
  VC_phi: number;

  @Prop({ type: Number, required: true, default: 0 })
  VC_nkl: number;

  @Prop({ type: Number, required: true, default: 0 })
  VC_phuPhi: number;

  @Prop({ type: Number, required: true, default: 0 })
  VC_dvgtkl: number;

  @Prop({ type: Boolean, default: false })
  VC_daoXoa: boolean;

  @Prop({ type: String, required: true })
  NV_id: string;
}

export const PHI_VAN_CHUYENSchema =
  SchemaFactory.createForClass(PHI_VAN_CHUYEN);
