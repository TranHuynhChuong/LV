import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LichSuThaoTacDG {
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

export const LichSuThaoTacDGSchema =
  SchemaFactory.createForClass(LichSuThaoTacDG);

@Schema()
export class DanhGia {
  @Prop({ type: Number, required: true })
  DG_diem: number;

  @Prop({ type: String, required: false })
  DG_noiDung?: string;

  @Prop({ type: Date, required: true, default: () => new Date() })
  DG_ngayTao: Date;

  @Prop({ type: Boolean, required: true, default: false })
  DG_daAn: boolean;

  @Prop({ type: Number, required: true })
  S_id: number;

  @Prop({ type: String, required: true })
  DH_id: string;

  @Prop({ type: Number, required: true })
  KH_id: number;

  @Prop({ type: [LichSuThaoTacDGSchema] })
  lichSuThaoTac: LichSuThaoTacDG[];
}

export type DanhGiaDocument = DanhGia & Document;
export const DanhGiaSchema = SchemaFactory.createForClass(DanhGia);

DanhGiaSchema.index({ KH_id: 1, DH_id: 1, S_id: 1 }, { unique: true });
DanhGiaSchema.index({ S_id: 1 });
DanhGiaSchema.index({ KH_id: 1 });
