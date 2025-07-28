export type BookOverViewDto = {
  S_id: number;
  S_isbn: string;
  S_ten: string;
  S_giaBan: number;
  S_giaNhap: number;
  S_daBan?: number;
  S_tonKho: number;
  S_anh: string;
  S_trangThai: string;
  S_diemDG?: number;
};

export type ImageDto = {
  A_publicId: string;
  A_url: string;
  A_anhBia: boolean;
};
