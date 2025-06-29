import { ActivityLogs } from '../activityLogs';

export type Review = {
  comment?: string;
  name: string;
  rating: number;
  createdAt: string;
  isHidden: boolean;

  activityLogs: ActivityLogs[];
  productName: string;
  productImage: string;
  productId: number;

  orderId: string;

  customerId: number;
};
