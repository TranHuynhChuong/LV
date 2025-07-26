import { Address, AddressDto } from '.';

export async function mapAddressListFromDto(apiList: AddressDto[]): Promise<Address[]> {
  // Map qua AddressType
  return apiList.map((item: AddressDto) => {
    return {
      id: item?.NH_id,
      orderId: item?.DH_id,
      name: item.NH_hoTen,
      phone: item.NH_soDienThoai,
      provinceId: item.T_id,
      wardId: item.X_id,
      fullName: item?.NH_diaChi,
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
    T_id: address.provinceId,
    X_id: address.wardId,
    NH_macDinh: address?.default,
    KH_id: userId,
  };
}
