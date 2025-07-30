/**
 * Kết quả thống kê tổng hợp cho các đơn hàng, voucher, khách hàng và khu vực
 */
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
}

/** Thống kê tổng số đơn hàng phân loại theo trạng thái */
export interface OrderTotalStats {
  all: number; // Tổng số đơn hàng
  complete: number; // Đơn hàng hoàn thành
  inComplete: number; // Đơn hàng chưa hoàn thành
  canceled: number; // Đơn hàng bị hủy
}

/** Thống kê chi tiết đơn hàng trong một đơn vị thời gian (ngày/tháng/năm) */
export interface OrderStatsByDate {
  total: OrderTotalStats; // Thống kê tổng số đơn hàng theo trạng thái
  complete: OrderDetailStats; // Thống kê chi tiết đơn hàng hoàn thành
  inComplete: OrderDetailStats; // Thống kê chi tiết đơn hàng chưa hoàn thành
}

/** Thống kê chi tiết các giá trị liên quan đơn hàng */
export interface OrderDetailStats {
  totalSalePrice: number; // Tổng giá bán sản phẩm (giá niêm yết)
  totalCostPrice: number; // Tổng giá vốn sản phẩm
  totalBuyPrice: number; // Tổng giá được người dùng mua
  totalQuantity: number; // Tổng số lượng sản phẩm
  totalBillSale: number; // Tổng doanh thu hóa đơn
  totalShipSale: number; // Tổng doanh thu phí vận chuyển
  totalShipPrice: number; // Tổng chi phí vận chuyển
}

/** Thống kê sử dụng voucher */
export interface VoucherStats {
  orderUsed: number; // Số đơn hàng đã sử dụng voucher
  typeStats: {
    shipping: number; // Số voucher giảm phí vận chuyển
    order: number; // Số voucher giảm giá đơn hàng
  };
}

/** Thống kê loại khách hàng */
export interface BuyerStats {
  member: number; // Số khách hàng thành viên
  guest: number; // Số khách hàng khách vãng lai
}

/** Thống kê sản phẩm được giảm giá */
export interface DiscountedProductStats {
  totalProducts: number; // Tổng số sản phẩm bán ra
  discountedProducts: number; // Số sản phẩm được giảm giá
}
