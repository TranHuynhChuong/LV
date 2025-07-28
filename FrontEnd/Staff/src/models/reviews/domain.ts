import { ActivityLogs } from '../activityLogs';

export type Review = {
  comment?: string;
  name: string;
  rating: number;
  createdAt: string;
  isHidden: boolean;
  activityLogs: ActivityLogs[];
  bookName: string;
  bookImage: string;
  bookId: number;
  orderId: string;
  customerId: number;
};
