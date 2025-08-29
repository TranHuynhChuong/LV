import { Expose } from 'class-transformer';

export class ResponseTTNhanHangDto {
  @Expose({ name: 'NH_id' })
  addressId: number;

  @Expose({ name: 'NH_hoTen' })
  fullName: string;

  @Expose({ name: 'NH_soDienThoai' })
  phone: string;

  @Expose({ name: 'NH_ghiChu' })
  note: string;

  @Expose({ name: 'T_id' })
  provinceId: number;

  @Expose({ name: 'X_id' })
  wardId: number;

  @Expose({ name: 'KH_id' })
  customerId: number;

  @Expose({ name: 'NH_macDinh' })
  isDefault: boolean;

  @Expose({ name: 'NH_diaChi' })
  address: string;
}
