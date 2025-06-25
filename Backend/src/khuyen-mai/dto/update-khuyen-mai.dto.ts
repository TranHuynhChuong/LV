import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateKhuyenMaiDto } from './create-khuyen-mai.dto';

export class UpdateKhuyenMaiDto extends PartialType(CreateKhuyenMaiDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
