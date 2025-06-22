import { ConflictException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DonHangDocument = DonHang & Document;
export type ChiTietDonHangDocument = ChiTietDonHang & Document;
export type MaGiamDonHangDocument = MaGiamDonHang & Document;

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

  // 1: Chờ xác nhận
  // 2: Chờ vận chuyển (Đã xác nhận)
  // 3: Đang vận chuyển (Đã xác nhận vận chuyển)
  // 4: Đã giao hàng thành công (Đã giao hàng)
  // 5: Đã giao hàng không thành công (Đã giao hàng)
  // 6: Yêu cầu hủy hàng (Chờ xác nhận hủy)
  // 7: Đã xác nhận hủy
  @Prop({ type: Number, required: true, default: 0 })
  DH_trangThai: number;

  @Prop({ type: [LichSuThaoTacDHSchema] })
  lichSuThaoTac: LichSuThaoTacDH[];

  //Có thể có hoặc không
  @Prop({ type: Number, required: false })
  KH_id?: number;

  //Có thể có hoặc không
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

@Schema()
export class ChiTietDonHang {
  @Prop({ type: String, required: true })
  DH_id: string;

  @Prop({ type: Number, required: true })
  SP_id: number;

  @Prop({ type: Number, required: true })
  CTDH_soLuong: number;

  @Prop({ type: Number, required: true })
  CTDH_giaNhap: number;

  @Prop({ type: Number, required: true })
  CTDH_giaBan: number;

  @Prop({ type: Number, required: true })
  CTDH_giaMua: number;
}

export const ChiTietDonHangSchema =
  SchemaFactory.createForClass(ChiTietDonHang);
ChiTietDonHangSchema.index({ DH_id: 1, SP_id: 1 }, { unique: true });

@Schema()
export class MaGiamDonHang {
  @Prop({ type: String, required: true })
  DH_id: string;

  @Prop({ type: String, required: true })
  MG_id: string;
}
export const MaGiamDonHangSchema = SchemaFactory.createForClass(MaGiamDonHang);
MaGiamDonHangSchema.index({ DH_id: 1, MG_id: 1 }, { unique: true });
