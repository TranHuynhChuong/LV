import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TTNhanHangKHDocument = TTNhanHangKH & Document;

@Schema()
export class TTNhanHangKH {
  @Prop({ type: Number })
  NH_id: number;

  @Prop({ type: String, required: true })
  NH_hoTen: string;

  @Prop({ type: String, required: true })
  NH_soDienThoai: string;

  @Prop({ type: String })
  NH_ghiChu: string;

  @Prop({ type: Number, required: true })
  T_id: number;

  @Prop({ type: Number, required: true })
  X_id: number;

  @Prop({ type: Number, required: true })
  KH_id: number;

  @Prop({ type: Boolean, default: false })
  NH_macDinh: boolean;
}

export const TTNhanHangKHSchema = SchemaFactory.createForClass(TTNhanHangKH);
TTNhanHangKHSchema.index({ NH_id: 1, KH_id: 1 }, { unique: true });

export type TTNhanHangDHDocument = TTNhanHangDH & Document;

@Schema()
export class TTNhanHangDH {
  @Prop({ type: String, unique: true, required: true })
  DH_id: string;

  @Prop({ type: String, required: true })
  NH_hoTen: string;

  @Prop({ type: String, required: true })
  NH_soDienThoai: string;

  @Prop({ type: String })
  NH_ghiChu: string;

  @Prop({ type: Number, required: true })
  T_id: number;

  @Prop({ type: Number, required: true })
  X_id: number;
}

export const TTNhanHangDHSchema = SchemaFactory.createForClass(TTNhanHangDH);
TTNhanHangDHSchema.index({ T_id: 1 });
