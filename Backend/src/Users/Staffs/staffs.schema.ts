import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NhanVienDocument = NhanVien & Document;

@Schema({
  timestamps: {
    createdAt: 'NV_tao',
    updatedAt: 'NV_capNhat',
  },
})
export class NhanVien {
  @Prop({ type: String, unique: true, required: true })
  NV_id: string;

  @Prop({ type: String, required: true })
  NV_hoTen: string;

  @Prop({ type: String, required: true })
  NV_soDienThoai: string;

  @Prop({ type: String, required: true })
  NV_email: string;

  @Prop({ type: String, required: true })
  NV_vaiTro: string;

  @Prop({ type: String, required: true })
  NV_matKhau: string;

  @Prop({
    type: String,
    required: true,
  })
  NV_idNV: string;

  @Prop({ type: Boolean, default: false })
  NV_daXoa: boolean;
}

export const NhanVienSchema = SchemaFactory.createForClass(NhanVien);
