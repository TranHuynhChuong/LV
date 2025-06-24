import { ActivityLogs } from '../activityLogs';

export interface Order {
  orderId: string;
  createdAt: string;
  status: number;
  discountInvoice: number;
  discountShipping: number;
  shippingFee: number;
  invoice: {
    taxCode: string;
    fullName: string;
    address: string;
    email: string;
  };
  customerId: number;
  customerEmail: string | null;
  activityLogs: ActivityLogs[];
  shippingInfo: {
    recipientName: string;
    phoneNumber: string;
    addressInfo: {
      province: {
        id: number;
        name: string;
      };
      ward: {
        id: number;
        name: string;
      };
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
    reviewed: boolean;
  }[];
}
