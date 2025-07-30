// ma-giam-gia.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Lịch sử thao tác áp dụng cho mã giảm giá.
 */
@Schema()
export class LichSuThaoTacMG {
  /**
   * Nội dung thao tác thực hiện (ví dụ: Tạo, cập nhật, xóa).
   */
  @Prop({ type: String })
  thaoTac: string;

  /**
   * Thời điểm thao tác được thực hiện.
   */
  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  /**
   * ID của nhân viên thực hiện thao tác.
   */
  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}
export const LichSuThaoTacMGSchema =
  SchemaFactory.createForClass(LichSuThaoTacMG);

export type MaGiamDocument = MaGiam & Document;

/**
 * Định nghĩa schema cho mã giảm giá.
 */
@Schema()
export class MaGiam {
  /**
   * Mã định danh duy nhất của mã giảm giá.
   */
  @Prop({ type: String, required: true, unique: true })
  MG_id: string;

  /**
   * Ngày bắt đầu hiệu lực của mã giảm giá.
   */
  @Prop({ type: Date, required: true })
  MG_batDau: Date;

  /**
   * Ngày kết thúc hiệu lực của mã giảm giá.
   */
  @Prop({ type: Date, required: true })
  MG_ketThuc: Date;

  /**
   * Xác định mã giảm giá theo tỷ lệ phần trăm (true) hay giá trị cố định (false).
   */
  @Prop({ type: Boolean, required: true })
  MG_theoTyLe: boolean;

  /**
   * Giá trị giảm (có thể là phần trăm hoặc số tiền cụ thể).
   */
  @Prop({ type: Number, required: true })
  MG_giaTri: number;

  /**
   * Loại mã giảm giá (giảm vận chuyển vc - tiền hàng hd).
   */
  @Prop({ type: String, required: true })
  MG_loai: string;

  /**
   * Giá trị đơn hàng tối thiểu để áp dụng mã.
   */
  @Prop({ type: Number, default: 0 })
  MG_toiThieu: number;

  /**
   * Mức giảm tối đa có thể áp dụng. (Tùy chọn).
   */
  @Prop({ type: Number })
  MG_toiDa?: number;

  /**
   * Danh sách lịch sử thao tác thực hiện trên mã giảm giá.
   */
  @Prop({ type: [LichSuThaoTacMGSchema] })
  lichSuThaoTac: LichSuThaoTacMG[];
}

export const MaGiamSchema = SchemaFactory.createForClass(MaGiam);
