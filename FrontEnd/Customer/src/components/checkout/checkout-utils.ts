import { Cart } from '@/models/cart';
import { Voucher } from '@/models/voucher';
import { useMemo } from 'react';

export type ShippingPolicy = {
  extraUnitGrams: number;
  baseWeightLimitKg: number;
  baseFee: number;
  extraFeePerUnit: number;
};

export type ShippingApiResponse = {
  PVC_dvpp: number;
  PVC_ntl: number;
  PVC_phi: number;
  PVC_phuPhi: number;
};

export function mapShippingPolicyFromApi(api: ShippingApiResponse): ShippingPolicy {
  return {
    extraUnitGrams: api.PVC_dvpp,
    baseWeightLimitKg: api.PVC_ntl,
    baseFee: api.PVC_phi,
    extraFeePerUnit: api.PVC_phuPhi,
  };
}

export function calculateShippingFee(books: Cart[], policy: ShippingPolicy): number {
  const totalWeightGrams = books.reduce((total, p) => total + p.weight * p.quantity, 0);
  const baseLimitGrams = policy.baseWeightLimitKg * 1000;
  if (totalWeightGrams <= baseLimitGrams) return policy.baseFee;
  const excessGrams = totalWeightGrams - baseLimitGrams;
  const extraUnits = Math.ceil(excessGrams / policy.extraUnitGrams);
  return policy.baseFee + extraUnits * policy.extraFeePerUnit;
}

export function calculateDiscounts(
  vouchers: Voucher[],
  orderTotal: number,
  shippingFee: number
): { productDiscount: number; shippingDiscount: number } {
  let productDiscount = 0;
  let shippingDiscount = 0;
  for (const v of vouchers) {
    if (orderTotal < v.minOrderValue) continue;
    const base = v.type === 'hd' ? orderTotal : shippingFee;
    let discount = v.isPercentage ? Math.floor((v.discountValue / 100) * base) : v.discountValue;
    if (v.maxDiscount !== undefined) discount = Math.min(discount, v.maxDiscount);
    if (v.type === 'hd') productDiscount += discount;
    else if (v.type === 'vc') shippingDiscount += discount;
  }

  return { productDiscount, shippingDiscount };
}

export function mapToDataCheck(carts: Cart[], vouchers: { code: string; type: string }[]) {
  const CTDH = carts.map((c) => ({
    S_id: c.id,
    CTDH_soLuong: c.quantity,
    CTDH_giaNhap: c.costPrice,
    CTDH_giaBan: c.salePrice,
    CTDH_giaMua: c.discountPrice,
  }));
  const MG = vouchers.length > 0 ? vouchers.map((v) => ({ MG_id: v.code })) : undefined;
  return { CTDH, MG };
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const useOrderSummary = (
  carts: Cart[],
  shippingPolicy: ShippingPolicy | undefined,
  vouchers: Voucher[]
) => {
  const orderTotal = useMemo(
    () => carts.reduce((sum, c) => sum + c.discountPrice * c.quantity, 0),
    [carts]
  );
  const shippingFee = useMemo(
    () => (shippingPolicy ? calculateShippingFee(carts, shippingPolicy) : 0),
    [carts, shippingPolicy]
  );
  const { productDiscount, shippingDiscount } = useMemo(
    () => calculateDiscounts(vouchers, orderTotal, shippingFee),
    [vouchers, orderTotal, shippingFee]
  );
  const orderTotalUnit = useMemo(
    () => carts.reduce((sum, c) => sum + c.salePrice * c.quantity, 0),
    [carts]
  );
  const total = orderTotal + shippingFee - productDiscount - shippingDiscount;
  const totalSaving = orderTotalUnit - orderTotal + productDiscount + shippingDiscount;
  return { orderTotal, shippingFee, productDiscount, shippingDiscount, total, totalSaving };
};
