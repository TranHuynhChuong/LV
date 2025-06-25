import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class CreateMaGiamDto {
  @IsString()
  @MaxLength(7)
  MG_id: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  MG_batDau: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  MG_ketThuc: Date;

  @IsBoolean()
  MG_theoTyLe: boolean;

  @IsNumber()
  MG_giaTri: number;

  @IsNumber()
  MG_loai: number;

  @IsNumber()
  MG_toiThieu: number;

  @IsOptional()
  @IsNumber()
  MG_toiDa?: number;

  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
