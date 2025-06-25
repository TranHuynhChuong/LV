import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NhanVienDocument = NhanVien & Document;

@Schema()
export class LichSuThaoTacNV {
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

export const LichSuThaoTacNVSchema =
  SchemaFactory.createForClass(LichSuThaoTacNV);

@Schema()
export class NhanVien {
  @Prop({ type: String, unique: true, required: true })
  NV_id: string;

  @Prop({ type: String, required: true, minlength: 2, maxlength: 48 })
  NV_hoTen: string;

  @Prop({ type: String, required: true, minlength: 9, maxlength: 11 })
  NV_soDienThoai: string;

  @Prop({ type: String, required: true, maxlength: 128 })
  NV_email: string;

  @Prop({ type: Number, required: true })
  NV_vaiTro: number;

  @Prop({ type: String, required: true, minlength: 6, maxlength: 72 })
  NV_matKhau: string;

  @Prop({ type: Boolean, default: false })
  NV_daXoa: boolean;

  @Prop({ type: [LichSuThaoTacNVSchema] })
  lichSuThaoTac: LichSuThaoTacNV[];
}

export const NhanVienSchema = SchemaFactory.createForClass(NhanVien);
