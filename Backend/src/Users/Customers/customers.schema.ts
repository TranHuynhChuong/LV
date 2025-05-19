import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type KHACH_HANGDocument = KHACH_HANG & Document;

@Schema({
  timestamps: {
    createdAt: 'KH_ngayTao',
  },
})
export class KHACH_HANG {
  @Prop({ type: String, required: true })
  KH_hoTen: string;

  @Prop({ type: String })
  KH_gioiTinh: string;

  @Prop({ type: Date })
  KH_ngaySinh: Date;

  @Prop({ type: String, unique: true })
  KH_email: string;

  @Prop({ type: String, required: true })
  KH_matKhau: string;
}

export const KHACH_HANGSchema = SchemaFactory.createForClass(KHACH_HANG);

KHACH_HANGSchema.pre('save', async function (next) {
  const user = this as KHACH_HANGDocument;

  if (user.isModified('KH_matKhau')) {
    const saltRounds = 10;
    user.KH_matKhau = await bcrypt.hash(user.KH_matKhau, saltRounds);
  }

  next();
});
