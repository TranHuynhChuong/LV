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

@Schema()
export class ChiTietSP {
  @Prop({ type: String, required: true })
  CTSP_ten: string;

  @Prop({ type: String, required: true })
  CTSP_giaTri: string;
}

@Schema({
  timestamps: {
    createdAt: 'SP_tao',
    updatedAt: 'SP_capNhat',
  },
})
export class SanPham {
  @Prop({ type: Number, required: true, unique: true })
  SP_id: number;

  @Prop({ type: Number, required: true })
  TL_id: number;

  @Prop({ type: String, required: true })
  NV_id: string;

  @Prop({ type: Number, default: 1 })
  SP_trangThai: number;

  @Prop({ type: String, required: true, maxlength: 128 })
  SP_ten: string;

  @Prop({ type: String, required: true, maxlength: 2000 })
  SP_noiDung: string;

  @Prop({ type: String, maxlength: 3000 })
  SP_moTa: string;

  @Prop({ type: Number, required: true })
  SP_giaBan: number;

  @Prop({ type: Number, required: true })
  SP_giaNhap: number;

  @Prop({ type: Number, default: 0 })
  SP_doanhSo: number;

  @Prop({ type: Number, required: true })
  SP_khoHang: number;

  @Prop({ type: Number, required: true })
  SP_trongLuong: number;

  @Prop({
    type: [Number],
    required: true,
  })
  SP_eNoiDung: number[];

  @Prop({ type: [AnhSP], required: true, default: [] })
  SP_anh: AnhSP[];

  @Prop({ type: [ChiTietSP], default: [] })
  SP_chiTiet: ChiTietSP[];
}

export const AnhSPSchema = SchemaFactory.createForClass(AnhSP);
export const ChiTietSPSchema = SchemaFactory.createForClass(ChiTietSP);
export const SanPhamSchema = SchemaFactory.createForClass(SanPham);
