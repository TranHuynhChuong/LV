import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChiTietDonHangDto {
  @IsNumber()
  S_id: number;

  @IsNumber()
  CTDH_soLuong: number;

  @IsNumber()
  CTDH_giaNhap: number;

  @IsNumber()
  CTDH_giaBan: number;

  @IsNumber()
  CTDH_giaMua: number;
}

export class CreateMaGiamDonHangDto {
  @IsString()
  MG_id: string;
}

export class CreateHoaDonDto {
  @IsString()
  HD_mst: string;

  @IsString()
  HD_hoTen: string;

  @IsString()
  HD_diaChi: string;

  @IsString()
  HD_email: string;
}

export class CreateTTNhanHangDHDto {
  @IsString()
  NH_hoTen: string;

  @IsString()
  NH_soDienThoai: string;

  @IsString()
  @IsOptional()
  NH_ghiChu?: string;

  @IsNumber()
  T_id: number;

  @IsNumber()
  X_id: number;
}

export class CreateDonHangDto {
  @IsNumber()
  DH_phiVC: number;

  @IsNumber()
  @IsOptional()
  KH_id?: number;

  @IsString()
  @IsOptional()
  KH_email?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChiTietDonHangDto)
  CTDH: CreateChiTietDonHangDto[];
}

export class CreateDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDonHangDto)
  DH: CreateDonHangDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateTTNhanHangDHDto)
  NH: CreateTTNhanHangDHDto;

  @ValidateNested()
  @Type(() => CreateHoaDonDto)
  @IsOptional()
  HD?: CreateHoaDonDto;

  @ValidateNested({ each: true })
  @Type(() => CreateMaGiamDonHangDto)
  @IsArray()
  @IsOptional()
  MG?: CreateMaGiamDonHangDto[];

  @IsString()
  @IsOptional()
  PhuongThucThanhToan?: string;
}

export class CheckDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChiTietDonHangDto)
  CTDH: CreateChiTietDonHangDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateMaGiamDonHangDto)
  @IsArray()
  @IsOptional()
  MG?: CreateMaGiamDonHangDto[];
}
