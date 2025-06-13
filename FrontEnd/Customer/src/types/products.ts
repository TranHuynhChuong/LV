export type ApiProductSimple = {
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

export type ProductSimple = {
  id: number;
  name: string;
  price: number;
  stock: number;
  cost: number;
  image: string;
  sold: number;
  score: number;
  categories: number[];
  status: number;
  selePrice?: number;
  discountPercent?: number;
};

export type ApiMetadate = {
  pagination: number[];
  totalItems: number;
  totalPage: number;
};
export type ApiResponse = {
  data: ApiProductSimple[];
  metadata: ApiMetadate;
};

export type ProductDetailType = {
  id: number;
  name: string;
  categories: {
    id: number;
    name: string;
  }[];
  status: number;
  summary: string;
  description?: string;
  author: string;
  publisher: string;
  publishYear: number;
  page: number;
  isbn: string;
  language: string;
  translator: string;
  price: number;
  stock: number;
  cost: number;
  weight: number;
  score: number;
  saled: number;
  coverImage: string;
  salePrice: number;
  productImages: string[];
};

export type ImageApi = {
  A_publicId: string;
  A_url: string;
  A_anhBia: boolean;
};

export type ProductDetailApiType = {
  SP_id: number;
  SP_ten: string;
  SP_TL: { id: number; ten: string }[];
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
  SP_giaNhap: number;
  SP_tonKho: number;
  SP_trongLuong: number;
  SP_diemDG: number;
  SP_daBan: number;
  SP_anh: {
    A_publicId: string;
    A_url: string;
    A_anhBia: boolean;
  }[];
};

export type PromotionApiItem = {
  KM_id: number;
  SP_id: number;
  CTKM_theoTyLe: boolean;
  CTKM_giaTri: number;
  CTKM_tamNgung: boolean;
};
