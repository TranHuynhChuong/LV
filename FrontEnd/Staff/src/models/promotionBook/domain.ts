import { BookOverView } from '../books/domain';

export type BookPromotionOverview = {
  id: number;
  name: string;
  startAt: Date;
  endAt: Date;
  totalBooks: number;
};

export type Details = {
  bookId: number;
  salePrice?: number;
  value: number;
  isPercent: boolean;
};

export type BookPromotionDetail = {
  id?: number;
  name?: string;
  from: Date;
  to: Date;
  details: Details[];
  books?: BookOverView[];
};
