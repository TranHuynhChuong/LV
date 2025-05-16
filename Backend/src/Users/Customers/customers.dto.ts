import { IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCustomerDto {
  @IsString()
  KH_hoTen: string;

  @IsEmail()
  KH_email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số',
  })
  KH_matKhau: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
