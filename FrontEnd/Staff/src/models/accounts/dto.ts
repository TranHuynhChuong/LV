export type StaffDto = {
  NV_id?: string;
  NV_vaiTro: number;
  NV_hoTen: string;
  NV_email: string;
  NV_soDienThoai: string;
  NV_idNV?: string;
  NV_matKhau: string;
};

export type CustomerDto = {
  KH_email: string;
  KH_hoTen: string;
  KH_ngayTao: Date;
};
