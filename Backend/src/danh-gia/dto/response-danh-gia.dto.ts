import { Expose } from 'class-transformer';

export class DanhGiaResponseDto {
  @Expose({ name: 'DG_diem' })
  rating: number;

  @Expose({ name: 'DG_noiDung' })
  content?: string;

  @Expose({ name: 'S_id' })
  bookId: number;

  @Expose({ name: 'DH_id' })
  orderId: string;

  @Expose({ name: 'KH_id' })
  customerId: number;

  @Expose({ name: 'KH_hoTen' })
  customerName: number;

  @Expose({ name: 'DG_ngayTao' })
  createAt: Date;

  @Expose({ name: 'DG_daAn' })
  isHiddend: boolean;

  @Expose({ name: 'S_ten' })
  title: string;

  @Expose({ name: 'S_anh' })
  image: string;
}
