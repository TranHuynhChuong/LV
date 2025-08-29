import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Expose, Transform, Type as TransformType } from 'class-transformer';

export class ChiTietKmDto {
  @IsInt()
  @Expose({ name: 'bookId' })
  S_id: number;

  @IsBoolean()
  @Expose({ name: 'percentageBased' })
  CTKM_theoTyLe: boolean;

  @IsInt()
  @Expose({ name: 'value' })
  CTKM_giaTri: number;

  @IsInt()
  @Expose({ name: 'purchasePrice' })
  CTKM_giaSauGiam: number;
}

export class CreateKhuyenMaiDto {
  @IsString()
  @MaxLength(128)
  @Expose({ name: 'promotionName' })
  KM_ten: string;

  @IsDate()
  @Expose({ name: 'startDate' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  KM_batDau: Date;

  @IsDate()
  @Expose({ name: 'endDate' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  KM_ketThuc: Date;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;

  @IsArray()
  @TransformType(() => ChiTietKmDto)
  @IsOptional()
  @Expose({ name: 'detail' })
  KM_chiTiet?: ChiTietKmDto[];
}
