export type ReviewOverview = {
  comment?: string;
  name: string;
  rating: number;
  createdAt: string;
  bookName?: string;
};

export type Review = {
  comment?: string;
  rating: number;
  createdAt: string;
  bookName: string;
  bookImage: string;
  orderId: string;
};
