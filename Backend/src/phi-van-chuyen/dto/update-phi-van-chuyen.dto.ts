import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePhiVanChuyenDto } from './create-phi-van-chuyen.dto';

export class UpdatePhiVanChuyenDto extends PartialType(CreatePhiVanChuyenDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
