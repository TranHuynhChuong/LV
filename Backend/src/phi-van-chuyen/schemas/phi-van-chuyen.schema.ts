import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhiVanChuyenDocument = PhiVanChuyen & Document;

@Schema()
export class PhiVanChuyen {
  /**
   * ID phí vận chuyển (duy nhất).
   */
  @Prop({ type: Number, unique: true })
  PVC_id: number;

  /**
   * Mức phí vận chuyển cơ bản.
   */
  @Prop({ type: Number, required: true })
  PVC_phi: number;

  /**
   * Ngưỡng trọng lượng - mức phí cơ bản được áp dụng cho đơn hàng có trọng lượng dưới nó.
   */
  @Prop({ type: Number, required: true })
  PVC_ntl: number;

  /**
   * Phụ phí thêm nếu có. Mặc định là 0.
   */
  @Prop({ type: Number, default: 0 })
  PVC_phuPhi: number;

  /**
   * Đơn vị phụ phí mỗi trọng lượng mà sẽ tính thêm phụ phí. Mặc định là 0.
   */
  @Prop({ type: Number, default: 0 })
  PVC_dvpp: number;

  /**
   * Trạng thái đã xóa hay chưa.
   * Nếu true thì bản ghi đã bị ẩn khỏi hệ thống.
   */
  @Prop({ type: Boolean, default: false })
  PVC_daXoa: boolean;

  /**
   * ID tỉnh thành ứng với phí vận chuyển này. 0 - khu vực còn lại.
   */
  @Prop({ type: Number, unique: true })
  T_id: number;
}

export const PhiVanChuyenSchema = SchemaFactory.createForClass(PhiVanChuyen);
