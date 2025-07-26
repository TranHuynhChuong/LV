export interface CartDto {
  S_id: number;
  S_ten: string;
  S_anh: string;
  S_giaBan: number;
  S_giaGiam: number;
  S_giaNhap: number;
  S_tonKho: number;
  S_trongLuong: number;
  GH_soLuong: number;
  GH_thoiGian: string;
}

export interface CartItemDto {
  S_id: number;
  GH_soLuong: number;
  GH_thoiGian: string;
}
