import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class CreateChiTietDonHangDto {
  @IsNumber()
  @Expose({ name: 'bookId' })
  S_id: number;

  @IsNumber()
  @Expose({ name: 'quantity' })
  CTDH_soLuong: number;

  @IsNumber()
  @Expose({ name: 'importPrice' })
  CTDH_giaNhap: number;

  @IsNumber()
  @Expose({ name: 'sellingPrice' })
  CTDH_giaBan: number;

  @IsNumber()
  @Expose({ name: 'purchasePrice' })
  CTDH_giaMua: number;
}

export class CreateMaGiamDonHangDto {
  @IsString()
  @Expose({ name: 'voucherId' })
  MG_id: string;
}

export class CreateHoaDonDto {
  @IsString()
  @Expose({ name: 'taxCode' })
  HD_mst: string;

  @IsString()
  @Expose({ name: 'fullName' })
  HD_hoTen: string;

  @IsString()
  @Expose({ name: 'address' })
  HD_diaChi: string;

  @IsString()
  @Expose({ name: 'email' })
  HD_email: string;
}

export class CreateTTNhanHangDHDto {
  @IsString()
  @Expose({ name: 'fullName' })
  NH_hoTen: string;

  @IsString()
  @Expose({ name: 'phone' })
  NH_soDienThoai: string;

  @IsString()
  @IsOptional()
  @Expose({ name: 'note' })
  NH_ghiChu?: string;

  @IsNumber()
  @Expose({ name: 'provinceId' })
  T_id: number;

  @IsNumber()
  @Expose({ name: 'wardId' })
  X_id: number;
}

export class CreateDonHangDto {
  @IsNumber()
  @Expose({ name: 'shippingFee' })
  DH_phiVC: number;

  @IsNumber()
  @IsOptional()
  @Expose({ name: 'customerId' })
  KH_id?: number;

  @IsString()
  @IsOptional()
  @Expose({ name: 'customerEmail' })
  KH_email?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChiTietDonHangDto)
  @Expose({ name: 'orderDetails' })
  CTDH: CreateChiTietDonHangDto[];
}

export class CreateDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDonHangDto)
  @Expose({ name: 'order' })
  DH: CreateDonHangDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateTTNhanHangDHDto)
  @Expose({ name: 'shippingInfo' })
  NH: CreateTTNhanHangDHDto;

  @ValidateNested()
  @Type(() => CreateHoaDonDto)
  @IsOptional()
  @Expose({ name: 'invoice' })
  HD?: CreateHoaDonDto;

  @ValidateNested({ each: true })
  @Type(() => CreateMaGiamDonHangDto)
  @IsArray()
  @IsOptional()
  @Expose({ name: 'vouchers' })
  MG?: CreateMaGiamDonHangDto[];

  @IsString()
  @IsOptional()
  @Expose({ name: 'paymentMethod' })
  PhuongThucThanhToan?: string;
}

export class CheckDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChiTietDonHangDto)
  @Expose({ name: 'orderDetails' })
  CTDH: CreateChiTietDonHangDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateMaGiamDonHangDto)
  @IsArray()
  @IsOptional()
  @Expose({ name: 'vouchers' })
  MG?: CreateMaGiamDonHangDto[];
}
