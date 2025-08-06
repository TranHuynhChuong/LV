import { PartialType } from '@nestjs/mapped-types';
import { CreateKhachHangDto } from './create-khach-hang.dto';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateKhachHangDto extends PartialType(CreateKhachHangDto) {
  @IsOptional()
  @IsString()
  KH_gioiTinh?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  KH_ngaySinh?: Date;
}
