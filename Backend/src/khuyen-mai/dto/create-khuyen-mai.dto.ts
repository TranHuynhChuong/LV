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

import { Transform, Type as TransformType } from 'class-transformer';

export class ChiTietKmDto {
  @IsInt()
  SP_id: number;

  @IsString()
  KM_id: string;

  @IsBoolean()
  CTKM_theoTyLe: boolean;

  @IsBoolean()
  CTKM_tamNgung: boolean;

  @IsInt()
  CTKM_giaTri: number;
}

export class CreateKhuyenMaiDto {
  @IsString()
  @MaxLength(128)
  KM_ten: string;

  @IsString()
  @MaxLength(7)
  KM_id: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  KM_batDau: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  KM_ketThuc: Date;

  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @IsArray()
  @TransformType(() => ChiTietKmDto)
  @IsOptional()
  KM_chiTiet?: ChiTietKmDto[];
}
