import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MaGiamDonHangDocument = MaGiamDonHang & Document;

@Schema()
export class MaGiamDonHang {
  @Prop({ type: String, required: true })
  DH_id: string;

  @Prop({ type: String, required: true })
  MG_id: string;
}
export const MaGiamDonHangSchema = SchemaFactory.createForClass(MaGiamDonHang);
MaGiamDonHangSchema.index({ DH_id: 1, MG_id: 1 }, { unique: true });
