import { Customer, CustomerDto, Staff, StaffDto } from '.';

export function mapCustomersFromDto(data: CustomerDto[]): Customer[] {
  return data.map((item) => ({
    name: item.KH_hoTen,
    email: item.KH_email,
    createAt: new Date(item.KH_ngayTao).toLocaleString('vi-VN'),
  }));
}

export function getRoleName(role: string): string {
  switch (role) {
    case '1':
      return 'Quản trị viên';
    case '2':
      return 'Quản lý';
    case '3':
      return 'Bán hàng';
    default:
      return 'Không xác định';
  }
}

export function mapStaffFormDto(data: StaffDto[]): Staff[] {
  return data.map((staff) => ({
    id: staff.NV_id,
    role: staff.NV_vaiTro.toString(),
    roleName: getRoleName(staff.NV_vaiTro.toString()),
    fullName: staff.NV_hoTen,
    email: staff.NV_email,
    phone: staff.NV_soDienThoai,
    password: staff.NV_matKhau,
    isBlock: staff.NV_daKhoa,
  }));
}

export function mapStaffToDto(data: Staff, staffId: string): StaffDto {
  return {
    NV_idNV: staffId,
    NV_vaiTro: Number(data.role),
    NV_hoTen: data.fullName,
    NV_email: data.email,
    NV_soDienThoai: data.phone,
    NV_matKhau: data.password,
    NV_daKhoa: data.isBlock,
  };
}
