import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import type { UpdateQuery } from 'mongoose';

export type KhachHangDocument = KhachHang & Document;

@Schema({
  timestamps: {
    createdAt: 'KH_ngayTao',
  },
})
export class KhachHang {
  @Prop({ type: String, required: true, minlength: 2, maxlength: 48 })
  KH_hoTen: string;

  @Prop({ type: String, default: null })
  KH_gioiTinh: string;

  @Prop({ type: Date, default: null })
  KH_ngaySinh: Date;

  @Prop({ type: String, unique: true, maxlength: 128 })
  KH_email: string;

  @Prop({ type: String, required: true, minlength: 6, maxlength: 72 })
  KH_matKhau: string;

  @Prop({ type: Number, unique: true })
  KH_id: number;
}

export const KhachHangSchema = SchemaFactory.createForClass(KhachHang);

KhachHangSchema.pre('save', async function (next) {
  const user = this as KhachHangDocument;

  if (user.isModified('KH_matKhau')) {
    const saltRounds = 10;
    user.KH_matKhau = await bcrypt.hash(user.KH_matKhau, saltRounds);
  }

  next();
});

KhachHangSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as UpdateQuery<KhachHang>;

  const matKhau = update?.KH_matKhau || update?.$set?.KH_matKhau;
  if (matKhau) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(matKhau, saltRounds);

    if (update.KH_matKhau) {
      update.KH_matKhau = hashed;
    } else if (update.$set?.KH_matKhau) {
      update.$set.KH_matKhau = hashed;
    }

    this.setUpdate(update);
  }

  next();
});
