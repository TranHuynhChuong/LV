import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

import { CreateSanPhamDto } from './create-san-pham.dto';

export class UpdateSanPhamDto extends PartialType(CreateSanPhamDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return [];
      }
    }
    return value as string[];
  })
  @IsArray()
  @IsOptional()
  imagesToDelete?: string[];
}
