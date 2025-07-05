export type ProductOverView = {
  id: number;
  isbn: string;
  name: string;
  salePrice: number;
  inventory: number;
  costPrice: number;
  image: string;
  status: number;
  sold?: number;
  score?: number;
};

export enum ProductFilterType {
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
