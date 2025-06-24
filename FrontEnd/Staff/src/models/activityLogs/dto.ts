export type ActivityLogsDto = {
  thoiGian: string;
  thaoTac: string;
  nhanVien: {
    NV_id: string;
    NV_hoTen: string;
    NV_soDienThoai: string;
    NV_email: string;
  };
};
