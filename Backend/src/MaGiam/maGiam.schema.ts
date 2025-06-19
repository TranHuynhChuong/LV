// ma-giam-gia.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LichSuThaoTacMG {
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
export const LichSuThaoTacMGSchema =
  SchemaFactory.createForClass(LichSuThaoTacMG);

export type MaGiamDocument = MaGiam & Document;

@Schema()
export class MaGiam {
  @Prop({ type: String, required: true, unique: true })
  MG_id: string;

  @Prop({ type: String, required: true })
  MG_ten: string;

  @Prop({ type: Date, required: true })
  MG_batDau: Date;

  @Prop({ type: Date, required: true })
  MG_ketThuc: Date;

  @Prop({ type: Boolean, required: true })
  MG_theoTyLe: boolean;

  @Prop({ type: Number, required: true })
  MG_giaTri: number;

  @Prop({ type: Number, required: true })
  MG_loai: number;

  @Prop({ type: Number, default: 0 })
  MG_toiThieu: number;

  @Prop({ type: Number })
  MG_toiDa?: number;

  @Prop({ type: [LichSuThaoTacMGSchema] })
  lichSuThaoTac: LichSuThaoTacMG[];
}

export const MaGiamSchema = SchemaFactory.createForClass(MaGiam);
