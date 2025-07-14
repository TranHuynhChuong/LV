import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type XaPhuongDocument = XaPhuong & Document;
export type DiaChiDocument = DiaChi & Document;

@Schema({ _id: false })
export class XaPhuong {
  @Prop({ required: true })
  X_id: number;

  @Prop({ required: true })
  X_ten: string;
}

@Schema()
export class DiaChi {
  @Prop({ required: true, unique: true })
  T_id: number;

  @Prop({ required: true })
  T_ten: string;

  @Prop({ type: [XaPhuong], default: [] })
  XaPhuong: XaPhuong[];
}

export const DiaChiSchema = SchemaFactory.createForClass(DiaChi);
