import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDanhGiaDto {
  @IsNumber()
  DH_diem: number;

  @IsOptional()
  @IsString()
  DH_noiDung?: string;

  @IsNumber()
  SP_id: number;

  @IsString()
  DH_id: string;

  @IsNumber()
  KH_id: number;
}
