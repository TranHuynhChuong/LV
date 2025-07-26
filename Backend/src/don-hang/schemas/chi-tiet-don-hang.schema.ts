import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChiTietDonHangDocument = ChiTietDonHang & Document;

@Schema()
export class ChiTietDonHang {
  @Prop({ type: String, required: true })
  DH_id: string;

  @Prop({ type: Number, required: true })
  S_id: number;

  @Prop({ type: Number, required: true })
  CTDH_soLuong: number;

  @Prop({ type: Number, required: true })
  CTDH_giaNhap: number;

  @Prop({ type: Number, required: true })
  CTDH_giaBan: number;

  @Prop({ type: Number, required: true })
  CTDH_giaMua: number;
}

export const ChiTietDonHangSchema =
  SchemaFactory.createForClass(ChiTietDonHang);
ChiTietDonHangSchema.index({ DH_id: 1, S_id: 1 }, { unique: true });
