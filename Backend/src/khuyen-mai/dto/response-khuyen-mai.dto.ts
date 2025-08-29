import { Expose, Type } from 'class-transformer';
import { SachResponseDto } from 'src/sach/dto/response-sach.dto';

export class DetailResponseDto {
  @Expose({ name: 'KM_id' })
  promotionId: number;

  @Expose({ name: 'S_id' })
  bookId: number;

  @Expose({ name: 'CTKM_theoTyLe' })
  percentageBased: boolean;

  @Expose({ name: 'CTKM_giaTri' })
  value: number;

  @Expose({ name: 'CTKM_giaSauGiam' })
  purchasePrice: number;
}

export class KhuyenMaiResponseDto {
  @Expose({ name: 'KM_id' })
  promotionId: number;

  @Expose({ name: 'KM_ten' })
  promotionName: string;

  @Expose({ name: 'KM_batDau' })
  startDate: Date;

  @Expose({ name: 'KM_ketThuc' })
  endDate: Date;

  @Expose({ name: 'KM_slTong' })
  totalQuantity: number;

  @Expose({ name: 'chiTietKhuyenMai' })
  @Type(() => DetailResponseDto)
  detail: DetailResponseDto[];

  @Expose({ name: 'saches' })
  @Type(() => SachResponseDto)
  books: SachResponseDto[];
}
