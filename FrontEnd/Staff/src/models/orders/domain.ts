import { ActivityLogs } from '../activityLogs';

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
      fulltext: string;
    };
    note: string;
  };

  orderDetails: {
    productId: number;
    quantity: number;
    priceBuy: number;
    priceSell: number;
    priceImport: number;
    productName: string;
    productImage: string;
    productStatus: number;
  }[];
}

export interface OrderOverview {
  orderId: string;
  createdAt: string;
  status: string;
  discountInvoice: number;
  discountShipping: number;
  shippingFee: number;
  requestInvoice: boolean;
  orderDetails: {
    productId: number;
    quantity: number;
    priceBuy: number;
    priceSell: number;
    priceImport: number;
    productName: string;
    productImage: string;
    productStatus: number;
  }[];
}
