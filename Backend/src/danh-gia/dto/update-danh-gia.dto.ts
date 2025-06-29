import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateDanhGiaDto {
  @IsString()
  @IsNotEmpty()
  NV_id: string;

  @IsNumber()
  SP_id: number;

  @IsString()
  DG_id: string;

  @IsNumber()
  KH_id: number;
}
