import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type XaPhuongDocument = XaPhuong & Document;

@Schema({ _id: false })
export class XaPhuong {
  @Prop({ required: true })
  X_id: number;

  @Prop({ required: true })
  X_ten: string;
}
export const XaPhuongSchema = SchemaFactory.createForClass(XaPhuong);

export type TinhThanhDocument = TinhThanh & Document;

@Schema({ collection: 'diachis' })
export class TinhThanh {
  @Prop({ required: true })
  T_id: number;

  @Prop({ required: true })
  T_ten: string;

  @Prop({ type: [XaPhuongSchema], default: [] })
  XaPhuong: XaPhuong[];
}

export const TinhThanhSchema = SchemaFactory.createForClass(TinhThanh);
