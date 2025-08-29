import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePhiVanChuyenDto {
  @IsInt()
  @Expose({ name: 'baseFee' })
  PVC_phi: number;

  @IsInt()
  @Expose({ name: 'baseWeightLimit' })
  PVC_ntl: number;

  @IsInt()
  @IsOptional()
  @Expose({ name: 'extraFeePerUnit' })
  PVC_phuPhi: number;

  @IsInt()
  @IsOptional()
  @Expose({ name: 'extraUnit' })
  PVC_dvpp: number;

  @IsInt()
  @Expose({ name: 'provinceId' })
  T_id: number;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;
}
