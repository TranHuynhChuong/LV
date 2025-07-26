import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SachDocument = Sach & Document;

@Schema()
export class Anh {
  @Prop({ type: String, required: true })
  A_publicId: string;

  @Prop({ type: String, required: true })
  A_url: string;

  @Prop({ type: Boolean, default: false })
  A_anhBia: boolean;
}
export const AnhSPSchema = SchemaFactory.createForClass(Anh);

@Schema()
export class LichSuThaoTacS {
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
export const LichSuThaoTacSPSchema =
  SchemaFactory.createForClass(LichSuThaoTacS);

export enum BookStatus {
  Show = 'Hien',
  Hidden = 'An',
  Deleted = 'daXoa',
}

@Schema()
export class Sach {
  @Prop({ type: Number, required: true, unique: true })
  S_id: number;

  @Prop({ type: [Number], required: true })
  TL_id: number[];

  @Prop({ type: String, enum: BookStatus, default: BookStatus.Show })
  S_trangThai: BookStatus;

  @Prop({ type: String, required: true, maxlength: 120 })
  S_ten: string;

  @Prop({ type: String, required: true, maxlength: 1200 })
  S_tomTat: string;

  @Prop({ type: String, maxlength: 3000 })
  S_moTa: string;

  @Prop({ type: String, required: true })
  S_tacGia: string;

  @Prop({ type: String, required: true })
  S_nhaXuatBan: string;

  @Prop({ type: String, required: true })
  S_ngonNgu: string;

  @Prop({ type: String })
  S_nguoiDich: string;

  @Prop({ type: Number, required: true })
  S_namXuatBan: number;

  @Prop({ type: Number, required: true })
  S_soTrang: number;

  @Prop({ type: String, required: true })
  S_isbn: string;

  @Prop({ type: Number, required: true })
  S_giaBan: number;

  @Prop({ type: Number, required: true })
  S_giaNhap: number;

  @Prop({ type: Number, default: 0 })
  S_daBan: number;

  @Prop({ type: Number, required: true })
  S_tonKho: number;

  @Prop({ type: Number, required: true })
  S_trongLuong: number;

  @Prop({ type: String, required: true })
  S_kichThuoc: string;

  @Prop({
    type: [Number],
    required: true,
  })
  S_eTomTat: number[];

  @Prop({ type: [AnhSPSchema], default: [] })
  S_anh: Anh[];

  @Prop({ type: [LichSuThaoTacSPSchema] })
  lichSuThaoTac: LichSuThaoTacS[];

  @Prop({ type: Number, default: 0 })
  S_diemDG: number;
}

export const SachSchema = SchemaFactory.createForClass(Sach);

SachSchema.index({ S_trangThai: 1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_daBan: -1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_diemDG: -1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_giaBan: 1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_giaBan: -1, S_id: -1 });
