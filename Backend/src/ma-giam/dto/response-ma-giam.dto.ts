import { Expose } from 'class-transformer';

export class MaGiamResponseDto {
  @Expose({ name: 'MG_id' })
  voucherId: string;

  @Expose({ name: 'MG_batDau' })
  startDate: Date;

  @Expose({ name: 'MG_ketThuc' })
  endDate: Date;

  @Expose({ name: 'MG_theoTyLe' })
  isPercentage: boolean;

  @Expose({ name: 'MG_giaTri' })
  value: number;

  @Expose({ name: 'MG_loai' })
  type: string;

  @Expose({ name: 'MG_toiThieu' })
  minValue: number;

  @Expose({ name: 'MG_toiDa' })
  maxValue?: number;

  @Expose({ name: 'NV_id' })
  staffId: string;
}
