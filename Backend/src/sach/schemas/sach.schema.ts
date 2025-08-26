import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SachDocument = Sach & Document;

/**
 * Định nghĩa ảnh sách.
 */
@Schema()
export class Anh {
  /**
   * ID công khai của ảnh trên dịch vụ lưu trữ (ví dụ Cloudinary)
   * */
  @Prop({ type: String, required: true })
  A_publicId: string;

  /**
   * URL truy cập ảnh
   */
  @Prop({ type: String, required: true })
  A_url: string;

  /**
   * Cờ đánh dấu ảnh này là ảnh bìa hay không
   */
  @Prop({ type: Boolean, default: false })
  A_anhBia: boolean;
}
export const AnhSPSchema = SchemaFactory.createForClass(Anh);

/**
 * Trạng thái hiển thị của sách.
 */
export enum BookStatus {
  Show = 'Hien',
  Hidden = 'An',
  Deleted = 'daXoa',
}

@Schema()
export class Sach {
  /**
   * Mã định danh sách, duy nhất
   */

  @Prop({ type: Number, required: true, unique: true })
  S_id: number;

  /**
   * Danh sách mã thể loại của sách
   */
  @Prop({ type: [Number], required: true })
  TL_id: number[];

  /**
   * Trạng thái sách (Hiển thị, Ẩn, Đã xoá)
   */
  @Prop({ type: String, enum: BookStatus, default: BookStatus.Show })
  S_trangThai: BookStatus;

  /**
   * Tên sách
   */
  @Prop({ type: String, required: true, maxlength: 120 })
  S_ten: string;

  /**
   * Tóm tắt sách
   */
  @Prop({ type: String, required: true, maxlength: 1200 })
  S_tomTat: string;

  /**
   * Mô tả chi tiết sách
   */
  @Prop({ type: String, maxlength: 3000 })
  S_moTa: string;

  /**
   * Tác giả sách
   */
  @Prop({ type: String, required: true })
  S_tacGia: string;

  /**
   * Nhà xuất bản
   */
  @Prop({ type: String, required: true })
  S_nhaXuatBan: string;

  /**
   * Ngôn ngữ sách
   */
  @Prop({ type: String, required: true })
  S_ngonNgu: string;

  /**
   * Người dịch sách (nếu có)
   */
  @Prop({ type: String })
  S_nguoiDich: string;

  /**
   * Năm xuất bản
   */
  @Prop({ type: Number, required: true })
  S_namXuatBan: number;

  /**
   * Số trang
   */
  @Prop({ type: Number, required: true })
  S_soTrang: number;

  /**
   * Mã ISBN
   */
  @Prop({ type: String, required: true })
  S_isbn: string;

  /**
   * Giá bán
   */
  @Prop({ type: Number, required: true })
  S_giaBan: number;

  /**
   * Giá nhập
   */
  @Prop({ type: Number, required: true })
  S_giaNhap: number;

  /**
   * Số lượng đã bán
   */
  @Prop({ type: Number, default: 0 })
  S_daBan: number;

  /**
   * Số lượng tồn kho
   */
  @Prop({ type: Number, required: true })
  S_tonKho: number;

  /**
   * Trọng lượng sách (gram)
   */
  @Prop({ type: Number, required: true })
  S_trongLuong: number;

  /**
   * Kích thước sách (ví dụ: 20x30 cm)
   */
  @Prop({ type: String, required: true })
  S_kichThuoc: string;

  /**
   * Vector embedding tóm tắt sách, dùng cho tìm kiếm (dimension cố định)
   */
  @Prop({
    type: [Number],
    required: true,
  })
  S_eTomTat: number[];

  /**
   * Danh sách ảnh của sách
   */
  @Prop({ type: [AnhSPSchema], default: [] })
  S_anh: Anh[];

  /**
   * Điểm đánh giá tổng (Hiển thị)
   */
  @Prop({ type: Number, default: 0 })
  S_diemDG: number;

  /**
   * Số lượng đánh giá (Hiển thị)
   */
  @Prop({ type: Number, default: 0 })
  S_soLuongDG: number;
}

export const SachSchema = SchemaFactory.createForClass(Sach);

SachSchema.index({ S_trangThai: 1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_daBan: -1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_diemDG: -1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_giaBan: 1, S_id: -1 });
SachSchema.index({ S_trangThai: 1, S_giaBan: -1, S_id: -1 });
