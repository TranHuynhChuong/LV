import { ActivityLogsDto } from '../activity-log';

export interface OrderDto {
  DH_id: string;
  DH_ngayTao: string;
  DH_trangThai: string;
  DH_giamHD: number;
  DH_giamVC: number;
  DH_phiVC: number;
  DH_HD: {
    HD_mst: string;
    HD_hoTen: string;
    HD_diaChi: string;
    HD_email: string;
    _id: string;
  };
  KH_id: number | null;
  KH_email: string | null;
  lichSuThaoTac: ActivityLogsDto[];
  thongTinNhanHang: {
    NH_hoTen: string;
    NH_soDienThoai: string;
    NH_diaChi: string;
    T_id: number;
    X_id: number;
    NH_ghiChu: string;
  };
  DH_daDanhGia: boolean;
  chiTietDonHang: {
    S_id: number;
    CTDH_soLuong: number;
    CTDH_giaMua: number;
    CTDH_giaBan: number;
    CTDH_giaNhap: number;
    S_ten: string;
    S_anh: string;
    S_trangThai: number;
  }[];
  DH_thanhToan?: {
    TT_daThanhToan: boolean;
    TT_phuongThuc: string;
  };
}

export interface OrderOverviewDto {
  DH_id: string;
  DH_ngayTao: string;
  DH_trangThai: string;
  DH_giamHD: number;
  DH_giamVC: number;
  DH_phiVC: number;
  KH_id: number | null;
  KH_email: string | null;
  chiTietDonHang: {
    S_id: number;
    CTDH_soLuong: number;
    CTDH_giaMua: number;
    CTDH_giaBan: number;
    CTDH_giaNhap: number;
    S_ten: string;
    S_anh: string;
    S_trangThai: number;
  }[];
  DH_daDanhGia: boolean;
  DH_thanhToan?: {
    TT_daThanhToan: boolean;
    TT_phuongThuc: string;
  };
}
