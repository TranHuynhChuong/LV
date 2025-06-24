import { Customer, CustomerDto, Staff, StaffDto } from '.';

export function mapCustomersFromDto(data: CustomerDto[]): Customer[] {
  return data.map((item) => ({
    name: item.KH_hoTen,
    email: item.KH_email,
    createAt: new Date(item.KH_ngayTao).toLocaleString('vi-VN'),
    status: item.KH_trangThai,
  }));
}

export function mapStaffFormDto(data: StaffDto[]): Staff[] {
  const getRole = (vaiTro: number) => {
    if (vaiTro === 1) return 'Quản trị';
    if (vaiTro === 2) return 'Quản lý';
    if (vaiTro === 3) return 'Bán hàng';
    return 'Không xác định';
  };
  return data.map((staff) => ({
    id: staff.NV_id,
    role: getRole(staff.NV_vaiTro),
    fullName: staff.NV_hoTen,
    email: staff.NV_email,
    phone: staff.NV_soDienThoai,
  }));
}

export function mapStaffToDto(data: Staff, staffId: string): StaffDto {
  const getRoleNumber = (role: string): number => {
    if (role === 'Quản trị') return 1;
    if (role === 'Quản lý') return 2;
    if (role === 'Bán hàng') return 3;
    return 0;
  };

  return {
    NV_id: data.id,
    NV_idNV: staffId,
    NV_vaiTro: getRoleNumber(data.role),
    NV_hoTen: data.fullName,
    NV_email: data.email,
    NV_soDienThoai: data.phone,
  };
}
