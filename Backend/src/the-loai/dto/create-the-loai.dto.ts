import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateTheLoaiDto {
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
