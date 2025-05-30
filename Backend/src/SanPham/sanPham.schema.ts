import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SanPhamDocument = SanPham & Document;

@Schema()
export class AnhSP {
  @Prop({ type: String, required: true })
  A_publicId: string;

  @Prop({ type: String, required: true })
  A_url: string;

  @Prop({ type: Boolean, default: false })
  A_anhBia: boolean;
}
export const AnhSPSchema = SchemaFactory.createForClass(AnhSP);

@Schema()
export class LichSuThaoTacSP {
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
  SchemaFactory.createForClass(LichSuThaoTacSP);

@Schema()
export class SanPham {
  @Prop({ type: Number, required: true, unique: true })
  SP_id: number;

  @Prop({ type: [Number], required: true })
  TL_id: number[];

  @Prop({ type: Number, default: 1 })
  SP_trangThai: number;

  @Prop({ type: String, required: true, maxlength: 120 })
  SP_ten: string;

  @Prop({ type: String, required: true, maxlength: 1000 })
  SP_noiDung: string;

  @Prop({ type: String, maxlength: 2000 })
  SP_moTa: string;

  @Prop({ type: String, required: true, maxlength: 250 })
  SP_tacGia: string;

  @Prop({ type: String, required: true, maxlength: 250 })
  SP_nhaXuaBan: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  SP_ngonNgu: string;

  @Prop({ type: String, required: true, maxlength: 120 })
  SP_nguoiDich: string;

  @Prop({ type: Number, required: true })
  SP_namXuatBan: number;

  @Prop({ type: Number, required: true })
  SP_soTrang: number;

  @Prop({ type: String, required: true, maxlength: 13 })
  SP_isbn: string;

  @Prop({ type: Number, required: true })
  SP_giaBan: number;

  @Prop({ type: Number, required: true })
  SP_giaNhap: number;

  @Prop({ type: Number, default: 0 })
  SP_daBan: number;

  @Prop({ type: Number, required: true })
  SP_tonKho: number;

  @Prop({ type: Number, required: true })
  SP_trongLuong: number;

  @Prop({
    type: [Number],
    required: true,
  })
  SP_eNoiDung: number[];

  @Prop({ type: [AnhSPSchema], required: true, default: [] })
  SP_anh: AnhSP[];

  @Prop({ type: [LichSuThaoTacSPSchema] })
  lichSuThaoTac: LichSuThaoTacSP[];
}

export const SanPhamSchema = SchemaFactory.createForClass(SanPham);
