import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMaGiamDto } from './create-ma-giam.dto';
import { Expose } from 'class-transformer';

export class UpdateMaGiamDto extends PartialType(CreateMaGiamDto) {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;
}
