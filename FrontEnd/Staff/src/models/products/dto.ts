export type ProductOverViewDto = {
  SP_id: number;
  SP_isbn: string;
  SP_ten: string;
  SP_giaBan: number;
  SP_giaNhap: number;
  SP_daBan?: number;
  SP_tonKho: number;
  SP_anh: string;
  SP_trangThai: number;
  SP_diemDG?: number;
};

export type ImageDto = {
  A_publicId: string;
  A_url: string;
  A_anhBia: boolean;
};
