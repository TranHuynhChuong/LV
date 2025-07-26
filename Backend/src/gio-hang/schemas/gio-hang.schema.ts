import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GioHangDocument = GioHang & Document;

@Schema()
export class GioHang {
  @Prop({ type: Number, required: true })
  KH_id: number;

  @Prop({ type: Number, required: true })
  S_id: number;

  @Prop({ type: Number, required: true })
  GH_soLuong: number;

  @Prop({ type: Date, required: true })
  GH_thoiGian: Date;
}

export const GioHangSchema = SchemaFactory.createForClass(GioHang);
GioHangSchema.index({ KH_id: 1, S_id: 1 }, { unique: true });
