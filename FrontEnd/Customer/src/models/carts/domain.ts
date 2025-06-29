export interface CartItem {
  productId: number;
  quantity: number;
  dateTime: string;
}

export interface Cart {
  productId: number;
  quantity: number;
  dateTime: string;

  // Product
  cover: string;
  name: string;
  costPrice: number;
  salePrice: number;
  discountPrice: number;
  discountPercent: number;
  inventory: number;
  weight: number;
  isOnSale: boolean;
}
