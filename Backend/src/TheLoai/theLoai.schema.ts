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
  @Prop({ type: Number, unique: true })
  TL_id: number;

  @Prop({ type: String, required: true, minlength: 2, maxlength: 24 })
  TL_ten: string;

  @Prop({ type: String, default: null })
  TL_idTL: string;

  @Prop({ type: String, required: true })
  NV_id: string;

  @Prop({ type: Boolean, default: false })
  TL_daXoa: boolean;
}

export const TheLoaiSchema = SchemaFactory.createForClass(TheLoai);
