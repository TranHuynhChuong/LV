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
import { BookStatus } from '../schemas/sach.schema';

export class CreateSachDto {
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

  @IsEnum(BookStatus)
  @IsOptional()
  S_trangThai?: BookStatus;

  @IsString()
  @MaxLength(120)
  S_ten: string;

  @IsString()
  @MaxLength(1200)
  S_tomTat: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  S_moTa?: string;

  @IsString()
  S_tacGia: string;

  @IsString()
  S_nhaXuatBan: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_namXuatBan: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_soTrang: number;

  @IsString()
  S_isbn: string;

  @IsString()
  @IsOptional()
  S_nguoiDich?: string;

  @IsString()
  S_ngonNgu: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_giaBan: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_giaNhap: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_tonKho: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_trongLuong: number;

  @IsString()
  S_kichThuoc: string;

  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
