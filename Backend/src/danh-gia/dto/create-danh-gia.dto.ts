import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDanhGiaDto {
  @IsNumber()
  DG_diem: number;

  @IsOptional()
  @IsString()
  DG_noiDung?: string;

  @IsNumber()
  S_id: number;

  @IsString()
  DH_id: string;

  @IsNumber()
  KH_id: number;
}
