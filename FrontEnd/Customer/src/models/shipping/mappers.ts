import { ShippingFee, ShippingFeeDto } from '.';

export async function getProvinceName(provinceId: number) {
  const provinces = await fetch('/addresses/0.json').then((res) => res.json());
  return (
    provinces.find((p: { T_id: number; T_ten: string }) => p.T_id === provinceId)?.T_ten ??
    'Khu vực còn lại'
  );
}

export async function mapShippingFeeFromDto(dto: ShippingFeeDto): Promise<ShippingFee> {
  return {
    fee: dto.PVC_phi,
    weight: dto.PVC_ntl,
    surcharge: dto.PVC_phuPhi,
    surchargeUnit: dto.PVC_dvpp,
    provinceId: dto.T_id,
    province: await getProvinceName(dto.T_id),
  };
}
