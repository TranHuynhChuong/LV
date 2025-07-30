import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChiTietKhuyenMaiDocument = ChiTietKhuyenMai & Document;

@Schema()
export class ChiTietKhuyenMai {
  /** Mã khuyến mãi */
  @Prop({ type: Number, required: true })
  KM_id: number;

  /** Mã sách được áp dụng khuyến mãi */
  @Prop({ type: Number, required: true })
  S_id: number;

  /**
   * Áp dụng khuyến mãi theo tỷ lệ phần trăm hay giá trị cố định
   * true = khuyến mãi theo tỷ lệ phần trăm
   * false = khuyến mãi theo giá trị tiền
   */
  @Prop({ type: Boolean, required: true })
  CTKM_theoTyLe: boolean;

  /** Giá trị khuyến mãi (phần trăm hoặc số tiền, tùy CTKM_theoTyLe) */
  @Prop({ type: Number, required: true })
  CTKM_giaTri: number;

  /** Giá sau khi áp dụng khuyến mãi (giá bán đã trừ khuyến mãi) */
  @Prop({ type: Number, required: true })
  CTKM_giaSauGiam: number;

  /** Cờ tạm ngưng áp dụng khuyến mãi (true nếu tạm ngưng) */
  @Prop({ type: Boolean, required: true, default: false })
  CTKM_tamNgung: boolean;

  /** Cờ đánh dấu đã xóa (true nếu đã bị xóa mềm) */
  @Prop({ type: Boolean, required: true, default: false })
  CTKM_daXoa: boolean;
}

export const ChiTietKhuyenMaiSchema =
  SchemaFactory.createForClass(ChiTietKhuyenMai);

/** Index theo mã khuyến mãi để truy vấn nhanh các chi tiết theo KM */
ChiTietKhuyenMaiSchema.index({ KM_id: 1 });
/**
 * Composite index phục vụ tìm kiếm theo sách,
 * lọc theo trạng thái xóa và tạm ngưng,
 * và sắp xếp hoặc lọc theo mã khuyến mãi.
 */
ChiTietKhuyenMaiSchema.index({
  S_id: 1,
  CTKM_daXoa: 1,
  CTKM_tamNgung: 1,
  KM_id: 1,
});
