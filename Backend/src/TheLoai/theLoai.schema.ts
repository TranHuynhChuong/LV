import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TheLoaiDocument = TheLoai & Document;

@Schema()
export class LichSuThaoTacTL {
  @Prop({ type: String })
  thaoTac: string;

  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}

export const LichSuThaoTacTLSchema =
  SchemaFactory.createForClass(LichSuThaoTacTL);

@Schema()
export class TheLoai {
  @Prop({ type: Number, unique: true })
  TL_id: number;

  @Prop({ type: String, required: true, minlength: 2, maxlength: 48 })
  TL_ten: string;

  @Prop({ type: Number, default: null })
  TL_idTL: number;

  @Prop({ type: Boolean, default: false })
  TL_daXoa: boolean;

  @Prop({ type: [LichSuThaoTacTLSchema] })
  lichSuThaoTac: LichSuThaoTacTL[];
}

export const TheLoaiSchema = SchemaFactory.createForClass(TheLoai);
