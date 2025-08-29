/**
 * Enum trạng thái đơn hàng
 */
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

export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  note: string;
  provinceId: number;
  wardId: number;
  address: string;
}

export interface OrderItem {
  bookId: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  importPrice: number;
  title: string;
  image: string;
  status: string;
}

export interface Payment {
  isPaid: boolean;
  method: string;
}

export interface Invoice {
  taxCode: string;
  fullName: string;
  address: string;
  email: string;
}

export interface Order {
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  discountInvoice: number;
  discountShipping: number;
  shippingFee: number;
  invoice: Invoice | null;
  customerId: number;
  customerEmail: string;
  shippingInfo: ShippingInfo;
  orderDetails: OrderItem[];
  payment: Payment;
  activityLogs: {
    time: Date;
    action: string;
    user: {
      id: string | null;
      name: string | null;
      email: string | null;
      phone: string | null;
      roleName: string | null;
    };
  }[];
}
