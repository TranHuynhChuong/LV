import { ConflictException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonHangDocument = DonHang & Document;

@Schema()
export class LichSuThaoTacDH {
  @Prop({ type: String })
  thaoTac: string;

  @Prop({ type: Date, default: Date.now })
  thoiGian: Date;

  @Prop({
    type: String,
    required: true,
  })
  NV_id: string;
}
export const LichSuThaoTacDHSchema =
  SchemaFactory.createForClass(LichSuThaoTacDH);

@Schema()
export class HoaDon {
  @Prop({ type: String, required: true })
  HD_mst: string;

  @Prop({ type: String, required: true })
  HD_hoTen: string;

  @Prop({ type: String, required: true })
  HD_diaChi: string;

  @Prop({ type: String, required: true })
  HD_email: string;
}

export const HoaDonSchema = SchemaFactory.createForClass(HoaDon);

export enum OrderStatus {
  Pendding = 'ChoXacNhan', // Chờ xác nhận
  ToShip = 'ChoVanChuyen', // Chờ vận chuyển (Đã xác nhận)
  Shipping = 'DangVanChuyen', // Đang vận chuyển (Đã xác nhận vận chuyển)
  Complete = 'GiaoThanhCong', // Đã giao hàng thành công
  InComplete = 'GiaoThatBai', // Đã giao hàng không thành công
  CancelRequest = 'YeuCauHuy', // Yêu cầu hủy hàng
  Canceled = 'DaHuy', // Đã xác nhận hủy
}

@Schema()
export class DonHang {
  @Prop({ type: String, required: true, unique: true, maxlength: 12 })
  DH_id: string;

  @Prop({ type: Date, required: true })
  DH_ngayTao: Date;

  @Prop({ type: Number, default: 0 })
  DH_giamHD: number;

  @Prop({ type: Number, default: 0 })
  DH_giamVC: number;

  @Prop({ type: Number, required: true })
  DH_phiVC: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    required: true,
    default: OrderStatus.Pendding,
  })
  DH_trangThai: OrderStatus;

  @Prop({ type: [LichSuThaoTacDHSchema] })
  lichSuThaoTac: LichSuThaoTacDH[];

  @Prop({ type: Number, required: false })
  KH_id?: number;

  @Prop({ type: String, required: false })
  KH_email?: string;

  @Prop({ type: HoaDonSchema, required: false })
  DH_HD: HoaDon;
}

export const DonHangSchema = SchemaFactory.createForClass(DonHang);

// Chỉ được tồn tại 1 trong 2:
// - KH_id: nếu là khách có tài khoản
// - KH_email: nếu là khách vãng lai
// Middleware đã kiểm tra điều kiện này
DonHangSchema.pre('save', function (next) {
  if (!this.KH_id && !this.KH_email) {
    return next(new ConflictException());
  }
  if (this.KH_id && this.KH_email) {
    return next(new ConflictException());
  }
  next();
});
