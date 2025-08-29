export interface CartItem {
  bookId: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  bookId: number;
  quantity: number;
  dateTime: string;
  image: string;
  title: string;
  importPrice: number;
  sellingPrice: number;
  purchasePrice: number;
  inventory: number;
  weight: number;
}
