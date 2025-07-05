import { ProductOverView } from '../products/domain';

export type ProductPromotionOverview = {
  id: number;
  name: string;
  startAt: Date;
  endAt: Date;
  totalProducts: number;
};

export type Details = {
  productId: number;
  value: number;
  isPercent: boolean;
  isBlocked: boolean;
};

export type ProductPromotionDetail = {
  id?: number;
  name?: string;
  from: Date;
  to: Date;
  details: Details[];
  products?: ProductOverView[];
};
