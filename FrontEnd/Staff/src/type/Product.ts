export type ApiProductSimple = {
  SP_id: number;
  SP_ten: string;
  SP_giaBan: number;
  SP_giaNhap: number;
  SP_daBan: number;
  SP_tonKho: number;
  SP_anh: string;
};

export type ProductSimple = {
  id: number;
  name: string;
  price: number;
  stock: number;
  cost: number;
  image: string;
  sold: number;
};
