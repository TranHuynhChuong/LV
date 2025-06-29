export type GroupByType = 'day' | 'month';

export interface StatsResult {
  orders: Record<string, OrderStatsByDate>;
  vouchers: VoucherStats;
  buyers: BuyerStats;
  totalDiscountStats: DiscountedProductStats;
  provinces: {
    provinceId: number;
    count: number;
  }[];
}

export interface OrderTotalStats {
  all: number;
  complete: number;
  inComplete: number;
  canceled: number;
}

export interface OrderStatsByDate {
  total: OrderTotalStats;
  complete: OrderDetailStats;
  inComplete: OrderDetailStats;
}

export interface OrderDetailStats {
  totalSalePrice: number;
  totalCostPrice: number;
  totalBuyPrice: number;
  totalQuantity: number;
  totalBillSale: number;
  totalShipSale: number;
  totalShipPrice: number;
}

export interface VoucherStats {
  orderUsed: number;
  typeStats: {
    shipping: number;
    order: number;
  };
}

export interface BuyerStats {
  member: number;
  guest: number;
}

export interface DiscountedProductStats {
  totalProducts: number;
  discountedProducts: number;
}
