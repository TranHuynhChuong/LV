import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type XaPhuongDocument = XaPhuong & Document;

/**
 * Schema đại diện cho xã/phường
 */
@Schema({ _id: false })
export class XaPhuong {
  /**Mã xã/phường*/
  @Prop({ required: true })
  X_id: number;

  /**Tên xã/phường*/
  @Prop({ required: true })
  X_ten: string;
}
export const XaPhuongSchema = SchemaFactory.createForClass(XaPhuong);

export type TinhThanhDocument = TinhThanh & Document;
/**
 * Schema đại diện cho tỉnh/thành phố, bao gồm danh sách xã/phường thuộc tỉnh/thành đó
 */
@Schema({ collection: 'diachis' })
export class TinhThanh {
  /**Mã tỉnh/thành phố*/
  @Prop({ required: true })
  T_id: number;

  /**Tên tỉnh/thành phố*/
  @Prop({ required: true })
  T_ten: string;

  /**Danh sách xã/phường thuộc tỉnh/thành phố này*/
  @Prop({ type: [XaPhuongSchema], default: [] })
  XaPhuong: XaPhuong[];
}

export const TinhThanhSchema = SchemaFactory.createForClass(TinhThanh);
