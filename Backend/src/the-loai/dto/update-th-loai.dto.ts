import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTheLoaiDto } from './create-the-loai.dto';
import { Expose } from 'class-transformer';

export class UpdateTheLoaiDto extends PartialType(CreateTheLoaiDto) {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;
}
