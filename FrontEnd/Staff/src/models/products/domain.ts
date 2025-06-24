export type ProductOverView = {
  id: number;
  name: string;
  salePrice: number;
  inventory: number;
  costPrice: number;
  image: string;
  status: number;
  sold?: number;
  score?: number;
};
