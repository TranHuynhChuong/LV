import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThanhToanDocument = ThanhToan & Document;

@Schema()
export class ThanhToan {
  /**
   * ID của đơn hàng
   */
  @Prop({ type: String, required: true })
  DH_id: string;

  /**
   * appTransId
   */
  @Prop({ type: String, required: true })
  TT_id: string;

  /**
   * Trạng thái đã thanh toán chưa
   */
  @Prop({ type: Boolean, default: false })
  TT_daThanhToan: boolean;

  /**
   * Phương thức thanh toán
   */
  @Prop({ type: String, required: true })
  TT_phuongThuc: string;
}

export const ThanhToanSchema = SchemaFactory.createForClass(ThanhToan);
