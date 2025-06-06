export type ApiStaff = {
  NV_id: string;
  NV_vaiTro: number;
  NV_hoTen: string;
  NV_email: string;
  NV_soDienThoai: string;
};

export type ApiCustomer = {
  KH_email: string;
  KH_hoTen: string;
  KH_ngayTao: Date;
  KH_trangThai: number;
};

export type Customer = {
  email: string;
  name: string;
  createAt: string;
  status: number;
};
