import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Expose, Transform } from 'class-transformer';

export class CreateMaGiamDto {
  @IsString()
  @MaxLength(7)
  @Expose({ name: 'voucherId' })
  MG_id: string;

  @IsDate()
  @Expose({ name: 'startDate' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  MG_batDau: Date;

  @IsDate()
  @Expose({ name: 'endDate' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  MG_ketThuc: Date;

  @IsBoolean()
  @Expose({ name: 'isPercentage' })
  MG_theoTyLe: boolean;

  @IsNumber()
  @Expose({ name: 'value' })
  MG_giaTri: number;

  @IsString()
  @Expose({ name: 'type' })
  MG_loai: string;

  @IsNumber()
  @Expose({ name: 'minValue' })
  MG_toiThieu: number;

  @IsOptional()
  @IsNumber()
  @Expose({ name: 'maxValue' })
  MG_toiDa?: number;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;
}
