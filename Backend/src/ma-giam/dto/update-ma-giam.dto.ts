import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { CreateMaGiamDto } from './create-ma-giam.dto';

export class UpdateMaGiamDto extends PartialType(CreateMaGiamDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
