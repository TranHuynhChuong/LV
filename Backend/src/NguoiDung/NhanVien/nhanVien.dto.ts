import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDto {
  @IsString()
  @MaxLength(48)
  @MinLength(2)
  NV_hoTen: string;

  @IsString()
  @MaxLength(11)
  @MinLength(9)
  NV_soDienThoai: string;

  @IsEmail()
  @MaxLength(128)
  NV_email: string;

  @IsNumber()
  NV_vaiTro: number;

  @IsString()
  @MinLength(6)
  NV_matKhau: string;

  @IsString()
  NV_idNV: string;
}

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  NV_idNV: string;
}
