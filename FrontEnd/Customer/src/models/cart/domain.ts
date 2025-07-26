export interface CartItem {
  id: number;
  quantity: number;
  dateTime: string;
}

export interface Cart {
  id: number;
  quantity: number;
  dateTime: string;

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
