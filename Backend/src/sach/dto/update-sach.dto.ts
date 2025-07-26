import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

import { CreateSachDto } from './create-sach.dto';

export class UpdateSachDto extends PartialType(CreateSachDto) {
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
