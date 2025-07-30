import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema cho lịch sử thao tác trên đánh giá
 */
@Schema()
export class LichSuThaoTacDG {
  /**Mô tả thao tác (ví dụ: "Ẩn đánh giá", "Hiển thị đánh giá")*/
  @Prop({ type: String })
  thaoTac: string;

  /**Thời gian thực hiện thao tác */
  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  /**Mã nhân viên thực hiện thao tác*/
  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}

export const LichSuThaoTacDGSchema =
  SchemaFactory.createForClass(LichSuThaoTacDG);

/**
 * Schema đánh giá sản phẩm (sách) đã mua của khách hàng
 */
@Schema()
export class DanhGia {
  /**Điểm đánh giá (1-5)*/
  @Prop({ type: Number, required: true })
  DG_diem: number;

  /**Nội dung đánh giá (có thể không có)*/
  @Prop({ type: String, required: false })
  DG_noiDung?: string;

  /**Thời gian tạo đánh giá*/
  @Prop({ type: Date, required: true, default: () => new Date() })
  DG_ngayTao: Date;

  /**Trạng thái ẩn (true) hoặc hiện (false) của đánh giá*/
  @Prop({ type: Boolean, required: true, default: false })
  DG_daAn: boolean;

  /**Mã sách được đánh giá*/
  @Prop({ type: Number, required: true })
  S_id: number;

  /**Mã đơn hàng liên quan*/
  @Prop({ type: String, required: true })
  DH_id: string;

  /**Mã khách hàng đánh giá*/
  @Prop({ type: Number, required: true })
  KH_id: number;

  /**Lịch sử thao tác trên đánh giá*/
  @Prop({ type: [LichSuThaoTacDGSchema] })
  lichSuThaoTac: LichSuThaoTacDG[];
}

export type DanhGiaDocument = DanhGia & Document;
export const DanhGiaSchema = SchemaFactory.createForClass(DanhGia);

/**
 * Các index giúp tối ưu truy vấn theo:
 * - KH_id, DH_id, S_id (unique) để đảm bảo mỗi khách hàng, đơn hàng, sách chỉ có 1 đánh giá
 * - S_id để nhanh tìm đánh giá theo sách
 * - KH_id để nhanh tìm đánh giá theo khách hàng
 */
DanhGiaSchema.index({ KH_id: 1, DH_id: 1, S_id: 1 }, { unique: true });
DanhGiaSchema.index({ S_id: 1 });
DanhGiaSchema.index({ KH_id: 1 });
