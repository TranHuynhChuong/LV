import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDto {
  @IsString()
  @MaxLength(48, { message: 'Họ tên tối đa 48 ký tự' })
  @MinLength(2, { message: 'Họ tên tối thiểu 2 ký tự' })
  NV_hoTen: string;

  @IsString()
  @MaxLength(11, { message: 'Số điện thoại tối đa 11 ký tự số' })
  @MinLength(9, { message: 'Số điện thoại phải tối thiểu 9 ký tự số' })
  NV_soDienThoai: string;

  @IsEmail()
  @MaxLength(128, { message: 'Email tối đa 128 ký tự' })
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

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  NV_idNV: string;
}
