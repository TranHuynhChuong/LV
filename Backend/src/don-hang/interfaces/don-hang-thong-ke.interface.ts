/**Kết quả thống kê tổng hợp cho các đơn hàng, voucher, khách hàng và khu vực*/
export interface StatsResult {
  /** Thống kê đơn hàng*/
  orders: Record<string, OrderStatsByDate>;
  /** Thống kê sử dụng voucher */
  vouchers: VoucherStats;
  /** Thống kê khách hàng theo loại (thành viên, khách vãng lai) */
  buyers: BuyerStats;
  /** Thống kê tổng hợp sản phẩm giảm giá */
  totalDiscountStats: DiscountedProductStats;
  /** Thống kê số lượng đơn hàng theo tỉnh/thành */
  provinces: {
    provinceId: number;
    provinceName: string;
    count: number;
  }[];
  reviews: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    totalOrders: number;
    hidden: number;
    visible: number;
  };
}

/** Thống kê tổng số đơn hàng phân loại theo trạng thái */
export interface OrderTotalStats {
  /**Tổng số đơn hàng*/
  all: number;
  /**Đơn hàng hoàn thành*/
  complete: number;
  /**Đơn hàng chưa hoàn thành*/
  inComplete: number;
  /**Đơn hàng bị hủy*/
  canceled: number;
}

/** Thống kê chi tiết đơn hàng trong một đơn vị thời gian (ngày/tháng/năm) */
export interface OrderStatsByDate {
  /** Tổng số đơn hàng */
  total: OrderTotalStats;
  /** Đơn hàng hoàn thành */
  complete: OrderDetailStats;
  /** Đơn hàng chưa hoàn thành */
  inComplete: OrderDetailStats;
}

/** Thống kê chi tiết các giá trị liên quan đơn hàng */
export interface OrderDetailStats {
  /**Tổng giá bán sản phẩm (giá niêm yết)*/
  totalSalePrice: number;
  /**Tổng giá vốn sản phẩm*/
  totalCostPrice: number;
  /**Tổng giá được người dùng mua*/
  totalBuyPrice: number;
  /**Tổng số lượng sản phẩm*/
  totalQuantity: number;
  /**Tổng doanh thu hóa đơn*/
  totalBillSale: number;
  /**Tổng doanh thu phí vận chuyển*/
  totalShipSale: number;
  /**Tổng chi phí vận chuyển*/
  totalShipPrice: number;
}

/** Thống kê sử dụng voucher */
export interface VoucherStats {
  /** Số đơn hàng đã sử dụng voucher */
  orderUsed: number;
  /** Thống kê theo loại voucher */
  typeStats: {
    /** Số voucher giảm phí vận chuyển */
    shipping: number;
    /** Số voucher giảm giá đơn hàng */
    order: number;
  };
}

/** Thống kê loại khách hàng đã đặt hàng*/
export interface BuyerStats {
  /** Số khách hàng thành viên */
  member: number;
  /** Số khách hàng khách vãng lai */
  guest: number;
}

/** Thống kê sản phẩm được giảm giá */
export interface DiscountedProductStats {
  /** Tổng số sản phẩm bán ra */
  totalProducts: number;
  /** Số sản phẩm được giảm giá */
  discountedProducts: number;
}
