export type Voucher = {
  type: string;
  code: string;
  from: Date;
  to: Date;
  isPercentage: boolean;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
};
