import { PartialType } from '@nestjs/mapped-types';
import { CreateNhanVienDto } from './create-nhan-vien.dto';
import { IsString } from 'class-validator';

export class UpdateNhanVienDto extends PartialType(CreateNhanVienDto) {
  @IsString()
  NV_idNV: string;
}
