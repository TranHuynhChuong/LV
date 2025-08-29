import { Expose, Type } from 'class-transformer';

export class ShippingInfoResponseDto {
  @Expose({ name: 'NH_hoTen' })
  fullName: string;

  @Expose({ name: 'NH_soDienThoai' })
  phoneNumber: string;

  @Expose({ name: 'NH_ghiChu' })
  note: string;

  @Expose({ name: 'T_id' })
  provinceId: number;

  @Expose({ name: 'X_id' })
  wardId: number;

  @Expose({ name: 'NH_diaChi' })
  address: string;
}

export class OrderItemResponseDto {
  @Expose({ name: 'S_id' })
  bookId: number;

  @Expose({ name: 'CTDH_soLuong' })
  quantity: number;

  @Expose({ name: 'CTDH_giaMua' })
  purchasePrice: number;

  @Expose({ name: 'CTDH_giaBan' })
  sellingPrice: number;

  @Expose({ name: 'CTDH_giaNhap' })
  importPrice: number;

  @Expose({ name: 'S_ten' })
  title: string;

  @Expose({ name: 'S_anh' })
  image: string;

  @Expose({ name: 'S_trangThai' })
  status: string;
}

export class PaymentResponseDto {
  @Expose({ name: 'TT_daThanhToan' })
  isPaid: boolean;

  @Expose({ name: 'TT_phuongThuc' })
  method: string;
}

export class InvoiceResponseDto {
  @Expose({ name: 'HD_mst' })
  taxCode: string;

  @Expose({ name: 'HD_hoTen' })
  fullName: string;

  @Expose({ name: 'HD_diaChi' })
  address: string;

  @Expose({ name: 'HD_email' })
  email: string;
}

export class DonHangResponseDto {
  @Expose({ name: 'DH_id' })
  orderId: string;

  @Expose({ name: 'DH_ngayTao' })
  createdAt: Date;

  @Expose({ name: 'DH_ngayCapNhat' })
  updatedAt: Date;

  @Expose({ name: 'DH_trangThai' })
  status: string;

  @Expose({ name: 'DH_giamHD' })
  discountInvoice: number;

  @Expose({ name: 'DH_giamVC' })
  discountShipping: number;

  @Expose({ name: 'DH_phiVC' })
  shippingFee: number;

  @Type(() => InvoiceResponseDto)
  @Expose({ name: 'DH_HD' })
  invoice: InvoiceResponseDto | null;

  @Expose({ name: 'KH_id' })
  customerId: number;

  @Expose({ name: 'KH_email' })
  customerEmail: string;

  @Type(() => ShippingInfoResponseDto)
  @Expose({ name: 'thongTinNhanHang' })
  shippingInfo: ShippingInfoResponseDto;

  @Type(() => OrderItemResponseDto)
  @Expose({ name: 'chiTietDonHang' })
  orderDetails: OrderItemResponseDto[];

  @Type(() => PaymentResponseDto)
  @Expose({ name: 'DH_thanhToan' })
  payment: PaymentResponseDto;

  @Expose({ name: 'lichSuThaoTac' })
  activityLogs: any[];
}
