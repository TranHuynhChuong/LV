import { PartialType } from '@nestjs/mapped-types';
import { CreateDanhGiaDto } from './create-danh-gia.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDanhGiaDto extends PartialType(CreateDanhGiaDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
