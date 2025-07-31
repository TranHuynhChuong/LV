import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KhuyenMaiDocument = KhuyenMai & Document;
/**
 * Lịch sử thao tác trên khuyến mãi
 */
@Schema()
export class LichSuThaoTacKM {
  /**
   * Mô tả thao tác thực hiện
   */
  @Prop({ type: String })
  thaoTac: string;

  /**
   * Thời gian thực hiện thao tác, mặc định là thời gian hiện tại khi tạo bản ghi
   */
  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  /**
   * Mã định danh nhân viên thực hiện thao tác
   */
  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}
export const LichSuThaoTacKMSchema =
  SchemaFactory.createForClass(LichSuThaoTacKM);

/**
 * Schema Khuyến mãi
 */
@Schema()
export class KhuyenMai {
  /**
   * Mã định danh khuyến mãi
   */
  @Prop({ type: Number, required: true, unique: true })
  KM_id: number;

  /**
   * Tên khuyến mãi
   */
  @Prop({ type: String, maxlength: 120 })
  KM_ten: string;

  /**
   * Ngày bắt đầu áp dụng khuyến mãi
   */
  @Prop({ type: Date, required: true })
  KM_batDau: Date;

  /**
   * Ngày kết thúc khuyến mãi
   */
  @Prop({ type: Date, required: true })
  KM_ketThuc: Date;

  /**
   * Mảng lịch sử các thao tác được thực hiện trên khuyến mãi này
   */
  @Prop({ type: [LichSuThaoTacKMSchema] })
  lichSuThaoTac: LichSuThaoTacKM[];
}

export const KhuyenMaiSchema = SchemaFactory.createForClass(KhuyenMai);

KhuyenMaiSchema.index({
  KM_id: 1,
  KM_batDau: 1,
  KM_ketThuc: 1,
});
