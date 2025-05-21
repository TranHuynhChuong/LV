import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShippingFeeDto {
  @IsInt()
  @IsOptional()
  VC_phi: number;

  @IsInt()
  @IsOptional()
  VC_nkl: number;

  @IsInt()
  @IsOptional()
  VC_phuPhi: number;

  @IsInt()
  @IsOptional()
  VC_dvgtkl: number;

  @IsInt()
  @IsOptional()
  T_id: number;

  @IsString()
  @IsNotEmpty()
  NV_id: string;
}
