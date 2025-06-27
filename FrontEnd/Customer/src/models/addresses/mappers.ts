import { Address, AddressDto } from '.';

export async function mapAddressListFromDto(apiList: AddressDto[]): Promise<Address[]> {
  // Load tất cả tỉnh
  const provinces: { T_id: number; T_ten: string }[] = await fetch('/addresses/0.json').then(
    (res) => res.json()
  );

  const provinceIds = Array.from(new Set(apiList.map((d) => d.T_id)));

  // Load xã theo từng tỉnh
  const wardLists = await Promise.all(
    provinceIds.map((id) => fetch(`/addresses/${id}.json`).then((res) => res.json()))
  );

  const wardMap: Record<number, { X_id: number; X_ten: string }[]> = {};
  provinceIds.forEach((id, index) => {
    wardMap[id] = wardLists[index];
  });

  // Map qua AddressType
  return apiList.map((item: AddressDto) => {
    const province = provinces.find((p) => p.T_id === item.T_id);
    const wardList = wardMap[item.T_id] || [];
    const ward = wardList.find((w) => w.X_id === item.X_id);

    return {
      id: item?.NH_id,
      orderId: item?.DH_id,
      name: item.NH_hoTen,
      phone: item.NH_soDienThoai,
      province: {
        id: item.T_id,
        name: province?.T_ten ?? 'Không xác định',
      },
      ward: {
        id: item.X_id,
        name: ward?.X_ten ?? 'Không xác định',
      },
      note: item.NH_ghiChu,
      userId: item?.KH_id,
      default: item?.NH_macDinh,
    };
  });
}

export function mapAddressToDto(address: Address, userId?: number): AddressDto {
  return {
    NH_hoTen: address.name,
    NH_soDienThoai: address.phone,
    NH_ghiChu: address.note,
    T_id: address.province.id,
    X_id: address.ward.id,
    NH_macDinh: address?.default,
    KH_id: userId,
  };
}
