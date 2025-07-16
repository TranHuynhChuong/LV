import { ShippingFee, ShippingFeeDto } from '.';

export function mapShippingFeeFromDto(dto: ShippingFeeDto): ShippingFee {
  return {
    fee: dto.PVC_phi,
    weight: dto.PVC_ntl,
    surcharge: dto.PVC_phuPhi,
    surchargeUnit: dto.PVC_dvpp,
    provinceId: dto.T_id,
  };
}

export function mapShippingFeesFromDtoList(dtos: ShippingFeeDto[]): ShippingFee[] {
  return dtos.map(mapShippingFeeFromDto);
}

export function mapShippingFeeToDto(data: ShippingFee, staffId: string): ShippingFeeDto {
  return {
    PVC_phi: data.fee ?? 0,
    PVC_ntl: data.weight ?? 0,
    PVC_phuPhi: data.surcharge ?? 0,
    PVC_dvpp: data.surchargeUnit ?? 0,
    T_id: data.provinceId ?? 0,
    T_ten: data.province ?? '',
    NV_id: staffId,
  };
}
