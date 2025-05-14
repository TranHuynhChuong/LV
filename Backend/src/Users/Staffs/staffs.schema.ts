import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type NHAN_VIENDocument = NHAN_VIEN & Document;

@Schema({
  timestamps: {
    createdAt: 'NV_ngayTao',
    updatedAt: 'NV_ngayCapNhat',
  },
})
export class NHAN_VIEN {
  @Prop({ type: String, unique: true, required: true })
  NV_ma: string;

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
    type: MongooseSchema.Types.ObjectId,
    ref: 'NHAN_VIEN',
    required: true,
  })
  NV_nguoiThucHien: MongooseSchema.Types.ObjectId;

  async hashPassword(): Promise<void> {
    const saltRounds = 10; // Số vòng mã hóa
    this.NV_matKhau = await bcrypt.hash(this.NV_matKhau, saltRounds);
  }
}

export const NHAN_VIENSchema = SchemaFactory.createForClass(NHAN_VIEN);

NHAN_VIENSchema.pre('save', async function (next) {
  const user = this as NHAN_VIENDocument;

  if (user.isModified('NV_matKhau')) {
    await user.hashPassword();
  }

  next();
});
