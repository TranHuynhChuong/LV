'use client';

import { OrderStats } from '@/models/stats';
import { FC } from 'react';

type Props = {
  detail: OrderStats;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

const StatsSummary: FC<Props> = ({ detail }) => {
  let totalOrders = 0;
  let revenueProduct = 0;
  let totalBuyPrice = 0;
  let costProduct = 0;
  let discountBill = 0;
  let revenueShip = 0;
  let netRevenueShip = 0;

  for (const d of Object.values(detail)) {
    totalOrders += d.total.complete + d.total.inComplete;
    revenueProduct += (d.complete?.totalSalePrice || 0) + (d.inComplete?.totalSalePrice || 0);
    totalBuyPrice += d.complete?.totalBuyPrice || 0;
    costProduct += (d.complete?.totalCostPrice || 0) + (d.inComplete?.totalCostPrice || 0);
    discountBill += d.complete?.totalBillSale || 0;
    revenueShip += (d.complete?.totalShipPrice || 0) + (d.inComplete?.totalShipPrice || 0);
    netRevenueShip += (d.complete?.totalShipPrice || 0) - (d.complete?.totalShipSale || 0);
  }

  const netRevenueProduct = totalBuyPrice - discountBill;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      <div className="p-4 bg-white border rounded-md">
        <div className="text-sm text-muted-foreground">Tổng đơn hàng đã giao</div>
        <div className="font-semibold">{totalOrders}</div>
      </div>
      <div className="p-4 bg-white border rounded-md">
        <div className="text-sm text-muted-foreground">Doanh thu (vận chuyển)</div>
        <div className="font-semibold">{formatCurrency(revenueShip)}</div>
      </div>
      <div className="p-4 bg-white border rounded-md">
        <div className="text-sm text-muted-foreground">Doanh thu thuần (vận chuyển)</div>
        <div className="font-semibold">{formatCurrency(netRevenueShip)}</div>
      </div>
      <div className="p-4 bg-white border rounded-md">
        <div className="text-sm text-muted-foreground">Giá vốn (sản phẩm)</div>
        <div className="font-semibold">{formatCurrency(costProduct)}</div>
      </div>
      <div className="p-4 bg-white border rounded-md">
        <div className="text-sm text-muted-foreground">Doanh thu (sản phẩm)</div>
        <div className="font-semibold">{formatCurrency(revenueProduct)}</div>
      </div>
      <div className="p-4 bg-white border rounded-md">
        <div className="text-sm text-muted-foreground">Doanh thu thuần (sản phẩm)</div>
        <div className="font-semibold">{formatCurrency(netRevenueProduct)}</div>
      </div>
    </div>
  );
};

export default StatsSummary;
