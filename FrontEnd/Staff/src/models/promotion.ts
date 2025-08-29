import { Book } from './book';

export interface PromotionDetail {
  promotionId?: number;
  bookId: number;
  percentageBased: boolean;
  value: number;
  purchasePrice?: number;
}

export interface Promotion {
  promotionId?: number;
  promotionName?: string;
  startDate: Date;
  endDate: Date;
  totalQuantity?: number;
  detail?: PromotionDetail[];
  books?: Book[];
}
