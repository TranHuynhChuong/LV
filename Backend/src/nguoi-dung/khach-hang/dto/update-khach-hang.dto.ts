import { PartialType } from '@nestjs/mapped-types';
import { CreateKhachHangDto } from './create-khach-hang.dto';
import { IsOptional, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class UpdateKhachHangDto extends PartialType(CreateKhachHangDto) {
  @IsOptional()
  @IsString()
  @Expose({ name: 'gender' })
  KH_gioiTinh?: string;

  @IsOptional()
  @Expose({ name: 'dob' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  KH_ngaySinh?: Date;
}
