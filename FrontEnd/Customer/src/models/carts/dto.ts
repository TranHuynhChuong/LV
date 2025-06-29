export interface CartDto {
  SP_id: number;
  SP_ten: string;
  SP_anh: string;
  SP_giaBan: number;
  SP_giaGiam: number;
  SP_giaNhap: number;
  SP_tonKho: number;
  SP_trongLuong: number;
  GH_soLuong: number;
  GH_thoiGian: string;
}

export interface CartItemDto {
  SP_id: number;
  GH_soLuong: number;
  GH_thoiGian: string;
}
