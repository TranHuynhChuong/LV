export enum BookSortType {
  MostRelevant = 'most-relevant',
  Latest = 'latest',
  BestSelling = 'best-selling',
  MostRating = 'most-rating',
  PriceAsc = 'price-asc',
  PriceDesc = 'price-desc',
}

export type BookOverview = {
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

export type BookDetail = {
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
  size: string;
  rating: number;
  saled: number;
  images: string[];
  similar: BookOverview[];
};
