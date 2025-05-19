import { IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStaffDto {
  @IsString()
  NV_hoTen: string;

  @IsString()
  NV_soDienThoai: string;

  @IsEmail()
  NV_email: string;

  @IsString()
  NV_vaiTro: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số',
  })
  NV_matKhau: string;

  @IsString()
  NV_idNV: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
