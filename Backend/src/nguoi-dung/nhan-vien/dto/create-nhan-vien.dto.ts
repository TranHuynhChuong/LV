import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateNhanVienDto {
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

  @IsBoolean()
  NV_daKhoa: string;
}
