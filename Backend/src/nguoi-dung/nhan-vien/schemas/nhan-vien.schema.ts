import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NhanVienDocument = NhanVien & Document;

/**
 * Lịch sử thao tác của nhân viên.
 */
@Schema()
export class LichSuThaoTacNV {
  /**
   * Nội dung thao tác mà nhân viên đã thực hiện.
   */
  @Prop({ type: String })
  thaoTac: string;

  /**
   * Thời gian thao tác, mặc định là thời điểm hiện tại.
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

export const LichSuThaoTacNVSchema =
  SchemaFactory.createForClass(LichSuThaoTacNV);

/**
 * Thông tin nhân viên.
 */
@Schema()
export class NhanVien {
  /**
   * Mã định danh duy nhất của nhân viên.
   */
  @Prop({ type: String, unique: true, required: true })
  NV_id: string;

  /**
   * Họ tên đầy đủ của nhân viên.
   */
  @Prop({ type: String, required: true, minlength: 2, maxlength: 48 })
  NV_hoTen: string;

  /**
   * Số điện thoại của nhân viên (9 đến 11 chữ số).
   */
  @Prop({ type: String, required: true, minlength: 9, maxlength: 11 })
  NV_soDienThoai: string;

  /**
   * Email liên hệ của nhân viên.
   */
  @Prop({ type: String, required: true, maxlength: 128 })
  NV_email: string;

  /**
   * Vai trò của nhân viên trong hệ thống (mã số).
   */
  @Prop({ type: Number, required: true })
  NV_vaiTro: number;

  /**
   * Mật khẩu.
   */
  @Prop({ type: String, required: true, minlength: 6, maxlength: 72 })
  NV_matKhau: string;

  /**
   * Trạng thái xóa mềm: `true` nếu nhân viên đã bị xóa, `false` nếu còn hoạt động.
   */
  @Prop({ type: Boolean, default: false })
  NV_daXoa: boolean;

  /**
   * Danh sách các thao tác mà nhân viên đã thực hiện.
   */
  @Prop({ type: [LichSuThaoTacNVSchema] })
  lichSuThaoTac: LichSuThaoTacNV[];
}

export const NhanVienSchema = SchemaFactory.createForClass(NhanVien);
