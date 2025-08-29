export interface Shipping {
  shippingFeeId: number;
  baseFee: number;
  baseWeightLimit: number;
  extraFeePerUnit?: number;
  extraUnit?: number;
  provinceId: number;
  provinceName: number;
}
