import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateNhanVienDto {
  @Expose({ name: 'fullName' })
  @IsString()
  @MaxLength(48)
  @MinLength(2)
  NV_hoTen: string;

  @Expose({ name: 'phone' })
  @IsString()
  @MaxLength(11)
  @MinLength(9)
  NV_soDienThoai: string;

  @Expose({ name: 'email' })
  @IsEmail()
  @MaxLength(128)
  NV_email: string;

  @Expose({ name: 'role' })
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value);
    }
    return value as number;
  })
  NV_vaiTro: number;

  @Expose({ name: 'password' })
  @IsString()
  @MinLength(6)
  NV_matKhau: string;

  @Expose({ name: 'staffId' })
  @IsString()
  NV_idNV: string;

  @Expose({ name: 'isBlock' })
  @IsBoolean()
  NV_daKhoa: string;
}
