import { IsNumber } from 'class-validator';

export class CreateGioHangDto {
  @IsNumber()
  KH_id: number;

  @IsNumber()
  SP_id: number;

  @IsNumber()
  GH_soLuong: number;
}
