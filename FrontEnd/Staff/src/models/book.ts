export enum BookFilterType {
  ShowAll = 'show-all',
  ShowInStock = 'show-in-stock',
  ShowOutOfStock = 'show-out-of-stock',

  HiddenAll = 'hidden-all',
  HiddenInStock = 'hidden-in-stock',
  HiddenOutOfStock = 'hidden-out-of-stock',

  AllAll = 'all-all',
  AllInStock = 'all-in-stock',
  AllOutOfStock = 'all-out-of-stock',

  ExcludeActivePromotion = 'excludeActivePromotion',
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
