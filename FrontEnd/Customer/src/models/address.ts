export interface Address {
  addressId?: number;
  fullName: string;
  phone: string;
  note: string;
  provinceId: number;
  wardId: number;
  customerId?: number;
  isDefault?: boolean;
  address?: string;
}
