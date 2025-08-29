import { Expose } from 'class-transformer';

export class ResponsePhiVanChuyenDto {
  @Expose({ name: 'PVC_id' })
  shippingFeeId: number;

  @Expose({ name: 'PVC_phi' })
  baseFee: number;

  @Expose({ name: 'PVC_ntl' })
  baseWeightLimit: number;

  @Expose({ name: 'PVC_phuPhi' })
  extraFeePerUnit: number;

  @Expose({ name: 'PVC_dvpp' })
  extraUnit: number;

  @Expose({ name: 'T_id' })
  provinceId: number;

  @Expose({ name: 'T_ten' })
  provinceName: number;
}
