export type VoucherPromotionOverview = {
  id: string;
  startAt: Date;
  endAt: Date;
  type: string;
};

export type VoucherPromotionDetail = {
  id: string;
  startAt: Date;
  endAt: Date;
  type: string;
  isPercentage?: boolean;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
};
