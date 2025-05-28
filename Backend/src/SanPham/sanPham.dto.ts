import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Expose, Transform, Type, plainToInstance } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class ChiTietSPDto {
  @IsString()
  @Expose()
  CTSP_ten: string;

  @IsString()
  @Expose()
  CTSP_giaTri: string;
}

export class AnhSPDto {
  @IsString()
  @Expose()
  A_publicId: string;

  @IsString()
  @Expose()
  A_url: string;

  @IsBoolean()
  @Expose()
  A_anhBia: boolean;
}
export class CreateDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  TL_id: number;

  @IsString()
  NV_id: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  SP_trangThai?: number;

  @IsString()
  @MaxLength(128)
  SP_ten: string;

  @IsString()
  @MaxLength(2000)
  SP_noiDung: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  SP_moTa?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_giaBan: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_giaNhap: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_khoHang: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_trongLuong: number;

  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return plainToInstance(ChiTietSPDto, JSON.parse(value));
      } catch {
        return [];
      }
    }
    return plainToInstance(ChiTietSPDto, value);
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChiTietSPDto)
  @IsOptional()
  SP_chiTiet?: ChiTietSPDto[];
}

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return plainToInstance(AnhSPDto, JSON.parse(value));
      } catch {
        return [];
      }
    }
    return plainToInstance(AnhSPDto, value);
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnhSPDto)
  @IsOptional()
  SP_anh?: AnhSPDto[];
}
