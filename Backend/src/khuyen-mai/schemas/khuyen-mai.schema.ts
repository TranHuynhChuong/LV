import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KhuyenMaiDocument = KhuyenMai & Document;

@Schema()
export class LichSuThaoTacKM {
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
export const LichSuThaoTacKMSchema =
  SchemaFactory.createForClass(LichSuThaoTacKM);

@Schema()
export class KhuyenMai {
  @Prop({ type: Number, required: true, unique: true })
  KM_id: number;

  @Prop({ type: String, maxlength: 120 })
  KM_ten: string;

  @Prop({ type: Date, required: true })
  KM_batDau: Date;

  @Prop({ type: Date, required: true })
  KM_ketThuc: Date;

  @Prop({ type: [LichSuThaoTacKMSchema] })
  lichSuThaoTac: LichSuThaoTacKM[];
}

export const KhuyenMaiSchema = SchemaFactory.createForClass(KhuyenMai);
KhuyenMaiSchema.index({
  KM_id: 1,
  KM_daXoa: 1,
  KM_batDau: 1,
  KM_ketThuc: 1,
});
