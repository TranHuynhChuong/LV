export interface Review {
  rating: number;
  content?: string;
  bookId: number;
  orderId?: string;
  customerId?: number;
  customerName?: string;
  createAt: Date;
  isHiddend?: number;
  title?: string;
  image?: string;
}
