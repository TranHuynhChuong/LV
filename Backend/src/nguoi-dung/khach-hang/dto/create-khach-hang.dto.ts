import { Expose } from 'class-transformer';
import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateKhachHangDto {
  @IsString()
  @Expose({ name: 'fullName' })
  KH_hoTen: string;

  @IsEmail()
  @Expose({ name: 'email' })
  KH_email: string;

  @IsString()
  @MinLength(6)
  @Expose({ name: 'password' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số',
  })
  KH_matKhau: string;
}
