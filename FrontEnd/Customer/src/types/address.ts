export type AddressType = {
  createAt?: Date;
  orderId?: string;
  name: string;
  phone: string;
  province: {
    id: number;
    name?: string;
  };
  ward: {
    id: number;
    name?: string;
  };
  note?: string;
  userId?: number;
  default?: boolean;
};

export type AddressApiType = {
  NH_ngayTao?: Date;
  DH_id?: string;
  NH_hoTen: string;
  NH_soDienThoai: string;
  NH_ghiChu?: string;
  T_id: number;
  X_id: number;
  NH_macDinh?: boolean;
  KH_id?: number;
};

export async function mapApiListToAddressList(apiList: AddressApiType[]): Promise<AddressType[]> {
  // Load tất cả tỉnh
  const provinces: { T_id: number; T_ten: string }[] = await fetch('/data/0.json').then((res) =>
    res.json()
  );

  const provinceIds = Array.from(new Set(apiList.map((d) => d.T_id)));

  // Load xã theo từng tỉnh
  const wardLists = await Promise.all(
    provinceIds.map((id) => fetch(`/data/${id}.json`).then((res) => res.json()))
  );

  const wardMap: Record<number, { X_id: number; X_ten: string }[]> = {};
  provinceIds.forEach((id, index) => {
    wardMap[id] = wardLists[index];
  });

  // Map qua AddressType
  return apiList.map((item: AddressApiType) => {
    const province = provinces.find((p) => p.T_id === item.T_id);
    const wardList = wardMap[item.T_id] || [];
    const ward = wardList.find((w) => w.X_id === item.X_id);

    return {
      createAt: item?.NH_ngayTao,
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

export function mapAddressToApi(address: AddressType): AddressApiType {
  return {
    NH_hoTen: address.name,
    NH_soDienThoai: address.phone,
    NH_ghiChu: address.note,
    T_id: address.province.id,
    X_id: address.ward.id,
    NH_macDinh: address.default,
    KH_id: address.userId,
  };
}
