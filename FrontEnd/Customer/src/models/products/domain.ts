export enum ProductSortType {
  MostRelevant = 'most-relevant',
  Latest = 'latest',
  BestSelling = 'best-selling',
  MostRating = 'most-rating',
  PriceAsc = 'price-asc',
  PriceDesc = 'price-desc',
}

export type ProductOverview = {
  id: number;
  name: string;
  salePrice: number;
  costPrice: number;
  discountPrice: number;
  discountPercent: number;
  image: string;
  inventory: number;
  sold: number;
  rating: number;
  categories: number[];
  status: number;
  isOnSale: boolean;
};

export type ProductDetail = {
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
  salePrice: number;
  costPrice: number;
  discountPrice: number;
  discountPercent: number;
  isOnSale: boolean;
  inventory: number;
  weight: number;
  rating: number;
  saled: number;
  coverImage: string;
  productImages: string[];
  similar: ProductOverview[];
};
