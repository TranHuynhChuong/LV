import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChiTietKhuyenMaiDocument = ChiTietKhuyenMai & Document;

@Schema()
export class ChiTietKhuyenMai {
  /**
   * Mã khuyến mãi
   * */
  @Prop({ type: Number, required: true })
  KM_id: number;

  /**
   * Mã sách được áp dụng khuyến mãi
   */
  @Prop({ type: Number, required: true })
  S_id: number;

  /**
   * Áp dụng khuyến mãi theo tỷ lệ phần trăm hay giá trị cố định
   * true = khuyến mãi theo tỷ lệ phần trăm
   * false = khuyến mãi theo giá trị tiền
   */
  @Prop({ type: Boolean, required: true })
  CTKM_theoTyLe: boolean;

  /**
   * Giá trị khuyến mãi (phần trăm hoặc số tiền, tùy CTKM_theoTyLe)
   */
  @Prop({ type: Number, required: true })
  CTKM_giaTri: number;

  /**
   * Giá sau khi áp dụng khuyến mãi (giá bán đã trừ khuyến mãi)
   */
  @Prop({ type: Number, required: true })
  CTKM_giaSauGiam: number;
}

export const ChiTietKhuyenMaiSchema =
  SchemaFactory.createForClass(ChiTietKhuyenMai);

ChiTietKhuyenMaiSchema.index({ KM_id: 1 });
ChiTietKhuyenMaiSchema.index({
  S_id: 1,
  CTKM_daXoa: 1,
  CTKM_tamNgung: 1,
  KM_id: 1,
});
