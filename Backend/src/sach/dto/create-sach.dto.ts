import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
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
  @Expose({ name: 'categoryIds' })
  TL_id: number[];

  @IsEnum(BookStatus)
  @IsOptional()
  @Expose({ name: 'status' })
  S_trangThai?: BookStatus;

  @MaxLength(120)
  @Expose({ name: 'title' })
  S_ten: string;

  @Expose({ name: 'summary' })
  @IsString()
  @MaxLength(1200)
  S_tomTat: string;

  @Expose({ name: 'description' })
  @IsOptional()
  @MaxLength(3000)
  S_moTa?: string;

  @Expose({ name: 'author' })
  @IsString()
  S_tacGia: string;

  @Expose({ name: 'publisher' })
  @IsString()
  S_nhaXuatBan: string;

  @Expose({ name: 'publishYear' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_namXuatBan: number;

  @Expose({ name: 'page' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_soTrang: number;

  @Expose({ name: 'isbn' })
  @IsString()
  S_isbn: string;

  @Expose({ name: 'translator' })
  @IsString()
  @IsOptional()
  S_nguoiDich?: string;

  @Expose({ name: 'language' })
  @IsString()
  S_ngonNgu: string;

  @Expose({ name: 'sellingPrice' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_giaBan: number;

  @Expose({ name: 'importPrice' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_giaNhap: number;

  @Expose({ name: 'inventory' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_tonKho: number;

  @Expose({ name: 'weight' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  S_trongLuong: number;

  @Expose({ name: 'size' })
  @IsString()
  S_kichThuoc: string;

  @IsString()
  @Expose({ name: 'staffId' })
  @IsNotEmpty()
  NV_id: string;
}
