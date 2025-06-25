import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePhiVanChuyenDto {
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
