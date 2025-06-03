import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDto {
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as number[];
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return value.map((v) => Number(v)).filter((v) => !isNaN(v));
    }
    return [];
  })
  @IsArray()
  TL_id: number[];

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  SP_trangThai?: number;

  @IsString()
  @MaxLength(120)
  SP_ten: string;

  @IsString()
  @MaxLength(1000)
  SP_tomTat: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  SP_moTa?: string;

  @IsString()
  @MaxLength(250)
  SP_tacGia: string;

  @IsString()
  @MaxLength(250)
  SP_nhaXuatBan: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_namXuatBan: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_soTrang: number;

  @IsString()
  @MaxLength(13)
  SP_isbn: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  SP_nguoiDich?: string;

  @IsString()
  @MaxLength(50)
  SP_ngonNgu: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_giaBan: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_giaNhap: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_tonKho: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_trongLuong: number;

  @IsString()
  @IsNotEmpty()
  NV_id: string;
}

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return [];
      }
    }
    return value as string[];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  imagesToDelete?: string[];
}
