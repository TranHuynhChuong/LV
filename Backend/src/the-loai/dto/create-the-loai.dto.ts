import { Expose } from 'class-transformer';
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
  @Expose({ name: 'name' })
  TL_ten: string;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;

  @IsOptional()
  @IsNumber()
  @Expose({ name: 'parentId' })
  TL_idTL?: number | null;
}
