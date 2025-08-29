import { Cart } from '@/models/cart';
import { Shipping } from '@/models/shipping';
import { Voucher } from '@/models/voucher';
import { useMemo } from 'react';

export function calculateShippingFee(books: Cart[], policy: Shipping): number {
  const totalWeightGrams = books.reduce((total, p) => total + p.weight * p.quantity, 0);
  const baseLimitGrams = policy.baseWeightLimit * 1000;
  if (totalWeightGrams <= baseLimitGrams) return policy.baseFee;
  const excessGrams = totalWeightGrams - baseLimitGrams;
  const extraUnits = Math.ceil(excessGrams / (policy.extraUnit ?? 1));
  return policy.baseFee + extraUnits * (policy.extraFeePerUnit ?? 1);
}

export function calculateDiscounts(
  vouchers: Voucher[],
  orderTotal: number,
  shippingFee: number
): { productDiscount: number; shippingDiscount: number } {
  let productDiscount = 0;
  let shippingDiscount = 0;
  for (const v of vouchers) {
    if (v.minValue && orderTotal < v.minValue) continue;
    const base = v.type === 'hd' ? orderTotal : shippingFee;
    let discount = v.isPercentage ? Math.floor((v.value / 100) * base) : v.value;
    if (v.maxValue !== undefined) discount = Math.min(discount, v.maxValue);
    if (v.type === 'hd') productDiscount += discount;
    else if (v.type === 'vc') shippingDiscount += discount;
  }

  return { productDiscount, shippingDiscount };
}

export function mapToDataCheck(carts: Cart[], voucherlist: { voucherId: string; type: string }[]) {
  const orderDetails = carts.map((c) => ({
    bookId: c.bookId,
    quantity: c.quantity,
    importPrice: c.importPrice,
    sellingPrice: c.sellingPrice,
    purchasePrice: c.purchasePrice,
  }));
  const vouchers =
    voucherlist.length > 0 ? voucherlist.map((v) => ({ voucherId: v.voucherId })) : undefined;
  return { orderDetails, vouchers };
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const useOrderSummary = (
  carts: Cart[],
  shipping: Shipping | undefined,
  vouchers: Voucher[]
) => {
  const orderTotal = useMemo(
    () => carts.reduce((sum, c) => sum + c.purchasePrice * c.quantity, 0),
    [carts]
  );
  const shippingFee = useMemo(
    () => (shipping ? calculateShippingFee(carts, shipping) : 0),
    [carts, shipping]
  );
  const { productDiscount, shippingDiscount } = useMemo(
    () => calculateDiscounts(vouchers, orderTotal, shippingFee),
    [vouchers, orderTotal, shippingFee]
  );
  const orderTotalUnit = useMemo(
    () => carts.reduce((sum, c) => sum + c.sellingPrice * c.quantity, 0),
    [carts]
  );
  const total = orderTotal + shippingFee - productDiscount - shippingDiscount;
  const totalSaving = orderTotalUnit - orderTotal + productDiscount + shippingDiscount;
  return { orderTotal, shippingFee, productDiscount, shippingDiscount, total, totalSaving };
};
