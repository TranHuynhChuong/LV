import {
  IsString,
  IsEmail,
  IsDateString,
  MinLength,
  Matches,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCustomerDto {
  @IsString()
  hoTen: string;

  @IsString()
  gioiTinh: string;

  @IsDateString()
  ngaySinh: Date;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số',
  })
  matKhau: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
