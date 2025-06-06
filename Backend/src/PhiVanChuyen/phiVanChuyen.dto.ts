import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDto {
  @IsInt()
  PVC_phi: number;

  @IsInt()
  PVC_ntl: number;

  @IsInt()
  @IsOptional()
  PVC_phuPhi: number;

  @IsInt()
  @IsOptional()
  PVC_dvpp: number;

  @IsInt()
  T_id: number;

  @IsString()
  @IsNotEmpty()
  NV_id: string;
}

export class UpdateDto extends PartialType(CreateDto) {
  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
