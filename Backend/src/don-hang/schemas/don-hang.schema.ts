import { ConflictException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonHangDocument = DonHang & Document;

/**
 * Lịch sử thao tác của đơn hàng
 */
@Schema()
export class LichSuThaoTacDH {
  /**
   * Nội dung thao tác
   */
  @Prop({ type: String })
  thaoTac: string;

  /**
   *Thời gian thao tác, mặc định là thời điểm tạo
   */
  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  /**
   * Mã nhân viên thực hiện thao tác
   */
  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}
export const LichSuThaoTacDHSchema =
  SchemaFactory.createForClass(LichSuThaoTacDH);

/**
 * Kiểu dữ liệu hóa đơn đi kèm đơn hàng
 */
@Schema()
export class HoaDon {
  /**
   * Mã số thuế của người mua
   */
  @Prop({ type: String, required: true })
  HD_mst: string;

  /**
   * Họ tên người nhận hóa đơn
   */
  @Prop({ type: String, required: true })
  HD_hoTen: string;

  /**
   * Địa chỉ nhận hóa đơn
   */
  @Prop({ type: String, required: true })
  HD_diaChi: string;

  /**
   * Email nhận hóa đơn
   */
  @Prop({ type: String, required: true })
  HD_email: string;
}

export const HoaDonSchema = SchemaFactory.createForClass(HoaDon);

/**
 * Enum trạng thái đơn hàng
 */
export enum TrangThaiDonHang {
  /** Chờ xác nhận */
  ChoXacNhan = 'ChoXacNhan',
  /** Chờ vận chuyển (Đơn hàng đã được xác nhận) */
  ChoVanChuyen = 'ChoVanChuyen',
  /** Đang vận chuyển (Đơn hàng đã được xác nhận vận chuyển) */
  DangVanChuyen = 'DangVanChuyen',
  /** Đã giao hàng thành công */
  GiaoThanhCong = 'GiaoThanhCong',
  /** Đã giao hàng không thành công */
  GiaoThatBai = 'GiaoThatBai',
  /** Có yêu cầu hủy hàng từ người mua */
  YeuCauHuy = 'YeuCauHuy',
  /** Đơn hàng đã được xác nhận hủy */
  DaHuy = 'DaHuy',
}

/**
 * Kiểu dữ liệu đơn hàng
 */
@Schema()
export class DonHang {
  /**
   * Mã đơn hàng, duy nhất, tối đa 12 ký tự  (AAA000000001 - ZZZ999999999)
   */
  @Prop({ type: String, required: true, unique: true, maxlength: 12 })
  DH_id: string;

  /**
   * Ngày tạo đơn hàng
   */
  @Prop({ type: Date, required: true })
  DH_ngayTao: Date;

  /**
   * Ngày cập nhật đơn hàng
   */
  @Prop({ type: Date, required: true })
  DH_ngayCapNhat: Date;

  /**
   * Giảm giá hóa đơn (tiền hàng được giảm)
   */
  @Prop({ type: Number, default: 0 })
  DH_giamHD: number;

  /**
   * Giảm giá vận chuyển
   */
  @Prop({ type: Number, default: 0 })
  DH_giamVC: number;

  /**
   * Phí vận chuyển
   */
  @Prop({ type: Number, required: true })
  DH_phiVC: number;

  /**
   * Trạng thái đơn hàng
   */
  @Prop({
    type: String,
    enum: TrangThaiDonHang,
    required: true,
    default: TrangThaiDonHang.ChoVanChuyen,
  })
  DH_trangThai: TrangThaiDonHang;

  /**
   * Lịch sử thao tác trên đơn hàng
   */
  @Prop({ type: [LichSuThaoTacDHSchema] })
  lichSuThaoTac: LichSuThaoTacDH[];

  /**
   * Mã khách hàng (nếu là khách có tài khoản)
   */
  @Prop({ type: Number, required: false })
  KH_id?: number;

  /**
   * Email khách hàng (nếu là khách vãng lai)
   */
  @Prop({ type: String, required: false })
  KH_email?: string;

  /**
   * Thông tin hóa đơn
   */
  @Prop({ type: HoaDonSchema, required: false })
  DH_HD: HoaDon;
}

export const DonHangSchema = SchemaFactory.createForClass(DonHang);

DonHangSchema.pre('save', function (next) {
  if (!this.KH_id && !this.KH_email) {
    return next(new ConflictException());
  }
  if (this.KH_id && this.KH_email) {
    return next(new ConflictException());
  }
  next();
});
