import { Optional } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTTNhanHangDto {
  @IsNumber()
  @IsNotEmpty()
  @Expose({ name: 'customerId' })
  KH_id: number;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'fullName' })
  NH_hoTen: string;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'phone' })
  NH_soDienThoai: string;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'note' })
  NH_ghiChu: string;

  @IsBoolean()
  @Optional()
  @Expose({ name: 'isDefault' })
  NH_macDinh: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Expose({ name: 'provinceId' })
  T_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Expose({ name: 'wardId' })
  X_id: number;
}
