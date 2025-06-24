import { ProductOverView } from '../products/domain';

export type ProductPromotionOverview = {
  id: string;
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
  id: string;
  name?: string;
  from: Date;
  to: Date;
  details: Details[];
  products?: ProductOverView[];
};
