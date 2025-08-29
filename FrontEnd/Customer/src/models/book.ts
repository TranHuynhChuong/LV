/**
 * Các kiểu sắp xếp sách trong danh sách.
 */
export enum BookSortType {
  /** Sắp xếp theo sách mới nhất (theo ngày hoặc mã sách giảm dần) */
  Latest = 'latest',

  /** Sắp xếp theo sách bán chạy nhất (số lượng đã bán giảm dần) */
  BestSelling = 'best-selling',

  /** Sắp xếp theo sách được đánh giá nhiều nhất (điểm đánh giá giảm dần) */
  MostRating = 'most-rating',

  /** Sắp xếp theo giá tăng dần */
  PriceAsc = 'price-asc',

  /** Sắp xếp theo giá giảm dần */
  PriceDesc = 'price-desc',

  /** Sắp xếp theo giá giảm dần */
  MostRelevant = 'most-relevant',
}

export interface Image {
  publicId: string;
  url: string;
  isCover: boolean;
}

export enum BookStatus {
  Show = 'Hien',
  Hidden = 'An',
  Deleted = 'daXoa',
}

export interface Book {
  bookId: number;
  title: string;
  author?: string;
  publisher?: string;
  publishYear?: number;
  page?: number;
  isbn?: string;
  translator?: string;
  language?: string;
  summary?: string;
  description?: string;
  sellingPrice: number;
  importPrice: number;
  purchasePrice: number;
  inventory?: number;
  weight?: number;
  size?: string;
  status?: BookStatus;
  sold: number;
  rating: number;
  reviewCount: number;
  categoryIds?: number[];
  categories: {
    id: number;
    name: string;
  }[];
  images: Image[] | string;
  similar?: Book[];
}
