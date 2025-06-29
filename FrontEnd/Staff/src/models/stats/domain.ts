export type OrderStats = {
  [key: string]: {
    total: {
      all: number;
      complete: number;
      inComplete: number;
      canceled: number;
    };
    complete: {
      totalSalePrice: number;
      totalCostPrice: number;
      totalBuyPrice: number;
      totalQuantity: number;
      totalBillSale: number;
      totalShipSale: number;
      totalShipPrice: number;
    };
    inComplete: {
      totalSalePrice: number;
      totalCostPrice: number;
      totalBuyPrice: number;
      totalQuantity: number;
      totalBillSale: number;
      totalShipSale: number;
      totalShipPrice: number;
    };
  };
};

export type Stats = {
  orders: OrderStats;
  vouchers: {
    orderUsed: number;
    typeStats: {
      shipping: number;
      order: number;
    };
  };
  buyers: {
    member: number;
    guest: number;
  };
  rating: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    totalOrders: number;
    hidden: number;
    visible: number;
  };
  totalDiscountStats: {
    totalProducts: number;
    discountedProducts: number;
  };
  provinces: {
    code: number;
    name: string;
    count: number;
  }[];
};
