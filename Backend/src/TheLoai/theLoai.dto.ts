import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  TL_ten: string;

  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @IsOptional()
  @IsNumber()
  TL_idTL?: number | null;
}

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
