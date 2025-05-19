import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NHAN_VIENDocument = NHAN_VIEN & Document;

@Schema({
  timestamps: {
    createdAt: 'NV_tao',
    updatedAt: 'NV_capNhat',
  },
})
export class NHAN_VIEN {
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

export const NHAN_VIENSchema = SchemaFactory.createForClass(NHAN_VIEN);
