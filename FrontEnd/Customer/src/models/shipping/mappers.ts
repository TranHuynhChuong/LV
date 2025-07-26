import { ShippingFee, ShippingFeeDto } from '.';

export async function mapShippingFeeFromDto(dto: ShippingFeeDto): Promise<ShippingFee> {
  return {
    fee: dto.PVC_phi,
    weight: dto.PVC_ntl,
    surcharge: dto.PVC_phuPhi,
    surchargeUnit: dto.PVC_dvpp,
    provinceId: dto.T_id,
    province: dto.T_ten,
  };
}
