export type GroupByType = 'day' | 'month';

export interface StatsResult {
  orders: {
    total: OrderTotalStats;
    detail: Record<string, OrderStatsByDate>;
  };
  vouchers: VoucherStats;
  buyers: BuyerStats;
  totalDiscountStats: DiscountedProductStats;
}

export interface OrderTotalStats {
  complete: number;
  inComplete: number;
  canceled: number;
}

export interface OrderStatsByDate {
  complete: OrderStatusStats;
  inComplete: OrderStatusStats;
  canceled: {
    total: number;
  };
}

export interface OrderStatusStats {
  total: number;
  stats: OrderDetailStats;
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
