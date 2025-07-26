import { ActivityLogs } from '../activity-log';

export enum OrderStatus {
  All = 'all',
  Pending = 'pending',
  ToShip = 'toShip',
  Shipping = 'shipping',
  Complete = 'complete',
  InComplete = 'inComplete',
  CancelRequest = 'cancelRequest',
  Canceled = 'canceled',
}

export interface Order {
  orderId: string;
  createdAt: string;
  status: string;
  discountInvoice: number;
  discountShipping: number;
  shippingFee: number;
  invoice: {
    taxCode: string;
    fullName: string;
    address: string;
    email: string;
  };
  customerId: number | null;
  customerEmail: string | null;
  activityLogs: ActivityLogs[];
  shippingInfo: {
    recipientName: string;
    phoneNumber: string;
    addressInfo: {
      provinceId: number;
      wardId: number;
      fullText: string;
    };
    note: string;
  };
  reviewed: boolean;
  orderDetails: {
    bookId: number;
    quantity: number;
    priceBuy: number;
    priceSell: number;
    priceImport: number;
    bookName: string;
    bookImage: string;
    bookStatus: number;
  }[];
}

export interface OrderOverview {
  orderId: string;
  createdAt: string;
  status: string;
  discountInvoice: number;
  discountShipping: number;
  shippingFee: number;
  customerId: number | null;
  customerEmail: string | null;
  reviewed: boolean;
  orderDetails: {
    bookId: number;
    quantity: number;
    priceBuy: number;
    priceSell: number;
    priceImport: number;
    bookName: string;
    bookImage: string;
    bookStatus: number;
  }[];
}
