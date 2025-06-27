'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
// lib/data/sales-stats.ts

export const salesStatsByMonthData = Array.from({ length: 30 }, (_, i) => {
  const month = i + 1;
  return {
    month,
    orderStatusStats: {
      complete: {
        detail: {
          totalSalePrice: 10000 + month * 100000,
          totalCostPrice: 800000 + month * 80000,
          totalBuyPrice: 850000 + month * 90000,
          totalQuantity: 10 + month,
        },
      },
      inComplete: {
        detail: {
          totalSalePrice: 20000 + month * 500000,
          totalCostPrice: 15000 + month * 40000,
          totalBuyPrice: 160000 + month * 45000,
          totalQuantity: 2 + i,
        },
      },
      canceled: {
        detail: {
          totalSalePrice: 100000 * i,
          totalCostPrice: 80000 * i,
          totalBuyPrice: 75000 * i,
          totalQuantity: i,
        },
      },
    },
    customerTypeStats: {
      member: {
        total: 5 + i,
        detail: {
          totalSalePrice: 100000 + month * 100000,
          totalCostPrice: 80000 + month * 8000,
          totalBuyPrice: 85000 + month * 9000,
          totalQuantity: 10 + i,
        },
      },
      guest: {
        total: i,
        detail: {
          totalSalePrice: 50000 * i,
          totalCostPrice: 40000 * i,
          totalBuyPrice: 45000 * i,
          totalQuantity: i,
        },
      },
    },
    voucherStats: {
      order: i % 2 === 0 ? 1 : 0,
      shipping: i % 3 === 0 ? 1 : 0,
    },
  };
});

const formatCurrency = (value: number) => `${value.toLocaleString()}đ `;

export default function SalesStatsPage() {
  const monthlyChartData = salesStatsByMonthData.map((entry) => ({
    month: `${entry.month}`,
    doanhThu: entry.orderStatusStats.complete.detail.totalSalePrice,
    giaNhap: entry.orderStatusStats.complete.detail.totalCostPrice,
    soLuong: entry.orderStatusStats.complete.detail.totalQuantity,
  }));

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent>
          <h2 className="mb-4 font-semibold">Doanh thu theo tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData} margin={{ top: 40, right: 30, left: 40, bottom: 5 }}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatCurrency} />
              <Legend />
              <Bar dataKey="doanhThu" fill="#27272a" name="Doanh thu" radius={2} />
              <Bar dataKey="giaNhap" fill="#52525c" name="Giá nhập" radius={2} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
