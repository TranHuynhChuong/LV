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

  @Prop({ type: String, required: true })
  KH_gioiTinh: string;

  @Prop({ type: Date, required: true })
  KH_ngaySinh: Date;

  @Prop({ type: String, unique: true, required: true })
  KH_email: string;

  @Prop({ type: String, required: true })
  KH_matKhau: string;

  async hashPassword(): Promise<void> {
    const saltRounds = 10; // Số vòng mã hóa
    this.KH_matKhau = await bcrypt.hash(this.KH_matKhau, saltRounds);
  }
}

export const KHACH_HANGSchema = SchemaFactory.createForClass(KHACH_HANG);

KHACH_HANGSchema.pre('save', async function (next) {
  const user = this as KHACH_HANGDocument;

  if (user.isModified('KH_matKhau')) {
    await user.hashPassword();
  }

  next();
});
