export type BookOverviewDto = {
  S_id: number;
  S_ten: string;
  S_giaBan: number;
  S_giaNhap: number;
  S_daBan: number;
  S_tonKho: number;
  S_anh: string;
  S_trangThai: number;
  S_diemDG: number;
  TL_id: number[];
  S_giaGiam: number;
};

export type ImageDto = {
  A_publicId: string;
  A_url: string;
  A_anhBia: boolean;
};

export type BookDetailDto = {
  S_id: number;
  S_ten: string;
  S_TL: { TL_id: number; TL_ten: string }[];
  S_trangThai: number;
  S_tomTat: string;
  S_moTa?: string;
  S_tacGia: string;
  S_nhaXuatBan: string;
  S_namXuatBan: number;
  S_soTrang: number;
  S_isbn: string;
  S_ngonNgu: string;
  S_nguoiDich: string;
  S_giaBan: number;
  S_giaGiam: number;
  S_giaNhap: number;
  S_tonKho: number;
  S_trongLuong: number;
  S_kichThuoc: string;
  S_diemDG: number;
  S_daBan: number;
  S_anh: {
    A_publicId: string;
    A_url: string;
    A_anhBia: boolean;
  }[];
  S_tuongTu: BookOverviewDto[];
};
