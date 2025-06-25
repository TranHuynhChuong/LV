import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductStatus } from '../schemas/san-pham.schema';

export class CreateSanPhamDto {
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

  @IsEnum(ProductStatus)
  @IsOptional()
  SP_trangThai?: ProductStatus;

  @IsString()
  @MaxLength(120)
  SP_ten: string;

  @IsString()
  @MaxLength(1200)
  SP_tomTat: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  SP_moTa?: string;

  @IsString()
  SP_tacGia: string;

  @IsString()
  SP_nhaXuatBan: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_namXuatBan: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  SP_soTrang: number;

  @IsString()
  SP_isbn: string;

  @IsString()
  @IsOptional()
  SP_nguoiDich?: string;

  @IsString()
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
