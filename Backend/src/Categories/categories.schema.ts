import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TheLoaiDocument = TheLoai & Document;

@Schema({
  timestamps: {
    createdAt: 'TL_tao',
    updatedAt: 'TL_capNhat',
  },
})
export class TheLoai {
  @Prop({ type: Number, required: true, unique: true })
  TL_ma: number;

  @Prop({ type: Number, required: true })
  TL_ten: number;

  @Prop({ type: Boolean, default: false })
  TL_daXoa: boolean;

  @Prop({ type: String, required: true })
  NV_id: string;
}

export const TheLoaiSchema = SchemaFactory.createForClass(TheLoai);
