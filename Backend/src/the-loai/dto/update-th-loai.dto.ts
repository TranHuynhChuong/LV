import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTheLoaiDto } from './create-the-loai.dto';

export class UpdateTheLoaiDto extends PartialType(CreateTheLoaiDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
