import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LichSuThaoTacDocument = LichSuThaoTac & Document;

export enum DULIEU {
  BOOK = 'Sach',
  REVIEW = 'DanhGia',
  ORDER = 'DonHang',
  VOUCHER = 'MaGiam',
  PROMOTION = 'KhuyenMai',
  ACCOUNT = 'TaiKhoan',
  SHIPPINGFEE = 'PhiVanChuyen',
  CATEGORY = 'TheLoai',
}

@Schema({
  timestamps: {
    createdAt: 'thoiGian',
  },
})
export class LichSuThaoTac {
  @Prop({ type: String, required: true })
  thaoTac: string;

  @Prop({ type: Date, required: true, default: Date.now })
  thoiGian: Date;

  @Prop({ type: String, required: true })
  NV_id: string;

  @Prop({ type: String, enum: Object.values(DULIEU), required: true })
  duLieu: DULIEU;

  @Prop({ type: String, required: true })
  idDuLieu: string;
}

export const LichSuThaoTacSchema = SchemaFactory.createForClass(LichSuThaoTac);

LichSuThaoTacSchema.index({ idDuLieu: 1, duLieu: 1, thoiGian: -1 });
