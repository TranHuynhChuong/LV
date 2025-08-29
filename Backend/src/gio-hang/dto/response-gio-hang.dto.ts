import { Expose } from 'class-transformer';

export class GioHangResponseDto {
  @Expose({ name: 'S_id' })
  bookId: number;

  @Expose({ name: 'GH_soLuong' })
  quantity: number;

  @Expose({ name: 'GH_thoiGian' })
  addedAt: Date;

  @Expose({ name: 'S_ten' })
  title: string;

  @Expose({ name: 'S_giaBan' })
  sellingPrice: number;

  @Expose({ name: 'S_giaNhap' })
  importPrice: number;

  @Expose({ name: 'S_tonKho' })
  inventory: number;

  @Expose({ name: 'S_giaGiam' })
  purchasePrice: number;

  @Expose({ name: 'S_anh' })
  image: string;

  @Expose({ name: 'S_trongLuong' })
  weight: number;
}
