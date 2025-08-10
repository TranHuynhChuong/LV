export type ReviewOverviewDto = {
  KH_hoTen: string;
  DG_diem: string;
  DG_ngayTao: Date;
  DG_noiDung?: string;
  S_ten?: string;
};

export type ReviewDto = {
  DG_diem: string;
  DG_ngayTao: Date;
  DG_noiDung?: string;
  S_ten: string;
  S_anh: string;
  S_id: number;
  DH_id: string;
};
