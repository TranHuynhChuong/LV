import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(24)
  TL_ten: string;

  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @IsOptional()
  @IsString()
  TL_idTL?: string | null;
}

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
