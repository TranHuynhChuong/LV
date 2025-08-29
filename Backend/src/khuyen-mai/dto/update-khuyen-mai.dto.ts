import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateKhuyenMaiDto } from './create-khuyen-mai.dto';
import { Expose } from 'class-transformer';

export class UpdateKhuyenMaiDto extends PartialType(CreateKhuyenMaiDto) {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;
}
