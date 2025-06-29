'use client';

import { FC } from 'react';

type OrderStatsDetail = {
  [key: string]: {
    complete: {
      total: number;
      stats: {
        totalSalePrice: number;
        totalCostPrice: number;
        totalBuyPrice: number;
        totalQuantity: number;
        totalBillSale: number;
        totalShipSale: number;
        totalShipPrice: number;
      };
    };
    inComplete: {
      total: number;
      stats: {
        totalSalePrice: number;
        totalCostPrice: number;
        totalBuyPrice: number;
        totalQuantity: number;
        totalBillSale: number;
        totalShipSale: number;
        totalShipPrice: number;
      };
    };
    canceled: { total: number };
  };
};

type OrderStatsTotal = {
  complete: number;
  inComplete: number;
  canceled: number;
};

type Props = {
  detail: OrderStatsDetail;
  total: OrderStatsTotal;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

const StatsSummary: FC<Props> = ({ detail, total }) => {
  const totalOrders = total.complete + total.inComplete;

  let revenueProduct = 0;
  let totalBuyPrice = 0;
  let costProduct = 0;
  let discountBill = 0;

  let revenueShip = 0;
  let netRevenueShip = 0;

  for (const d of Object.values(detail)) {
    // Sản phẩm
    revenueProduct +=
      (d.complete?.stats?.totalSalePrice || 0) + (d.inComplete?.stats?.totalSalePrice || 0);

    totalBuyPrice += d.complete?.stats?.totalBuyPrice || 0;

    costProduct +=
      (d.complete?.stats?.totalCostPrice || 0) + (d.inComplete?.stats?.totalCostPrice || 0);

    discountBill += d.complete?.stats?.totalBillSale || 0;

    // Vận chuyển
    revenueShip +=
      (d.complete?.stats?.totalShipPrice || 0) + (d.inComplete?.stats?.totalShipPrice || 0);

    netRevenueShip +=
      (d.complete?.stats?.totalShipPrice || 0) - (d.complete?.stats?.totalShipSale || 0);
  }

  const netRevenueProduct = totalBuyPrice - discountBill;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {/* Tổng đơn hàng */}
      <div className="bg-white rounded-md p-4 border">
        <div className="text-sm text-muted-foreground">Tổng đơn hàng</div>
        <div className="font-semibold">{totalOrders}</div>
      </div>

      {/* Doanh thu VC */}
      <div className="bg-white rounded-md p-4 border">
        <div className="text-sm text-muted-foreground">Doanh thu (vận chuyển)</div>
        <div className="font-semibold">{formatCurrency(revenueShip)}</div>
      </div>

      {/* Doanh thu thuần VC */}
      <div className="bg-white rounded-md p-4 border">
        <div className="text-sm text-muted-foreground">Doanh thu thuần (vận chuyển)</div>
        <div className="font-semibold">{formatCurrency(netRevenueShip)}</div>
      </div>
      {/* Giá vốn SP */}
      <div className="bg-white rounded-md p-4 border">
        <div className="text-sm text-muted-foreground">Giá vốn (sản phẩm)</div>
        <div className="font-semibold">{formatCurrency(costProduct)}</div>
      </div>
      {/* Doanh thu SP */}
      <div className="bg-white rounded-md p-4 border">
        <div className="text-sm text-muted-foreground">Doanh thu (sản phẩm)</div>
        <div className="font-semibold">{formatCurrency(revenueProduct)}</div>
      </div>

      {/* Doanh thu thuần SP */}
      <div className="bg-white rounded-md p-4 border">
        <div className="text-sm text-muted-foreground">Doanh thu thuần (sản phẩm)</div>
        <div className="font-semibold">{formatCurrency(netRevenueProduct)}</div>
      </div>
    </div>
  );
};

export default StatsSummary;
