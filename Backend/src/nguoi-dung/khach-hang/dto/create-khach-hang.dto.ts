import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateKhachHangDto {
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
