export type ProductOverviewDto = {
  SP_id: number;
  SP_ten: string;
  SP_giaBan: number;
  SP_giaNhap: number;
  SP_daBan: number;
  SP_tonKho: number;
  SP_anh: string;
  SP_trangThai: number;
  SP_diemDG: number;
  TL_id: number[];
  SP_giaGiam: number;
};

export type ImageDto = {
  A_publicId: string;
  A_url: string;
  A_anhBia: boolean;
};

export type ProductDetailDto = {
  SP_id: number;
  SP_ten: string;
  SP_TL: { TL_id: number; TL_ten: string }[];
  SP_trangThai: number;
  SP_tomTat: string;
  SP_moTa?: string;
  SP_tacGia: string;
  SP_nhaXuatBan: string;
  SP_namXuatBan: number;
  SP_soTrang: number;
  SP_isbn: string;
  SP_ngonNgu: string;
  SP_nguoiDich: string;
  SP_giaBan: number;
  SP_giaGiam: number;
  SP_giaNhap: number;
  SP_tonKho: number;
  SP_trongLuong: number;
  SP_kichThuoc: string;
  SP_diemDG: number;
  SP_daBan: number;
  SP_anh: {
    A_publicId: string;
    A_url: string;
    A_anhBia: boolean;
  }[];
  SP_tuongTu: ProductOverviewDto[];
};
