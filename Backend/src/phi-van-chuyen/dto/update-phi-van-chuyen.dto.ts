import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePhiVanChuyenDto } from './create-phi-van-chuyen.dto';
import { Expose } from 'class-transformer';

export class UpdatePhiVanChuyenDto extends PartialType(CreatePhiVanChuyenDto) {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;
}
