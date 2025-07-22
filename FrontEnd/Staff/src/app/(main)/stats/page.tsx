'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import StatsOrderComposedChart from '@/components/stats/statsOrderComposedChart';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import StatsSummary from '@/components/stats/statsSumary';
import RatioPieChart from '@/components/stats/statsRatioPieChart';
import StatsBarChart from '@/components/stats/statsBarChart';
import { Stats } from '@/models/stats';
import ExportStatsExcelButton from '@/components/stats/statsExportFile';
import { DateRange } from 'react-day-picker';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import DateRangePicker from '@/components/utils/DateRangePicker';

function calculateOrderTotalsFromStats(orders: Stats['orders']): Stats['orders'][string]['total'] {
  return Object.values(orders).reduce(
    (acc, item) => {
      acc.all += item.total.all;
      acc.complete += item.total.complete;
      acc.inComplete += item.total.inComplete;
      acc.canceled += item.total.canceled;
      return acc;
    },
    { all: 0, complete: 0, inComplete: 0, canceled: 0 }
  );
}

export type TimeUnit = 'day' | 'month' | 'year';

export function getTimeUnitByRange(range: DateRange): TimeUnit {
  const start = range.from;
  const end = range.to;

  if (!start || !end) return 'day';

  const diffInMonths =
    end.getFullYear() * 12 + end.getMonth() - (start.getFullYear() * 12 + start.getMonth());

  if (diffInMonths > 12) return 'year';
  if (diffInMonths > 2) return 'month';
  return 'day';
}

// Helper: Lấy tất cả ngày trong khoảng
export const getAllDatesInRange = (range: DateRange): string[] => {
  const { from, to } = range;
  if (!from || !to) return [];

  const result: string[] = [];
  const date = new Date(from);

  while (date <= to) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    result.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }

  return result;
};

// Helper: Lấy tất cả tháng trong khoảng
export const getAllMonthsInRange = (range: DateRange): string[] => {
  const { from, to } = range;
  if (!from || !to) return [];

  const result: string[] = [];
  const date = new Date(from.getFullYear(), from.getMonth(), 1);

  while (date <= to) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
    date.setMonth(date.getMonth() + 1);
  }

  return result;
};

// Helper: Lấy tất cả năm trong khoảng
export const getAllYearsInRange = (range: DateRange): string[] => {
  const { from, to } = range;
  if (!from || !to) return [];

  const startYear = from.getFullYear();
  const endYear = to.getFullYear();
  const result: string[] = [];

  for (let y = startYear; y <= endYear; y++) {
    result.push(String(y));
  }

  return result;
};

export default function StatsPage() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Thống kê bán hàng' }]);
  }, [setBreadcrumbs]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [totalOrders, setTotalOrders] = useState<{
    all: number;
    complete: number;
    inComplete: number;
    canceled: number;
  }>({ all: 0, complete: 0, inComplete: 0, canceled: 0 });

  const today = new Date();
  const [range, setRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');

  useEffect(() => {
    if (!range) return;
    const fromDate = range?.from ? startOfDay(range.from).toDateString() : undefined;
    const toDate = range?.to ? endOfDay(range.to).toDateString() : undefined;

    setTimeUnit(getTimeUnitByRange(range));

    const fetchOrders = api.get(`/orders/stats`, {
      params: {
        from: fromDate,
        to: toDate,
      },
    });

    const fetchReviews = api.get(`/reviews/stats`, {
      params: {
        from: fromDate,
        to: toDate,
      },
    });

    Promise.all([fetchOrders, fetchReviews])
      .then(([ordersRes, reviewsRes]) => {
        const ordersData = ordersRes.data.orders;
        let timeKeys: string[] = [];

        switch (timeUnit) {
          case 'day':
            timeKeys = getAllDatesInRange(range);
            break;
          case 'month':
            timeKeys = getAllMonthsInRange(range);
            break;
          case 'year':
            timeKeys = getAllYearsInRange(range);
            break;
          default:
            timeKeys = [];
        }

        for (const key of timeKeys) {
          ordersData[key] ??= {
            total: {
              all: 0,
              complete: 0,
              inComplete: 0,
              canceled: 0,
            },
            complete: {
              totalSalePrice: 0,
              totalCostPrice: 0,
              totalBuyPrice: 0,
              totalQuantity: 0,
              totalBillSale: 0,
              totalShipSale: 0,
              totalShipPrice: 0,
            },
            inComplete: {
              totalSalePrice: 0,
              totalCostPrice: 0,
              totalBuyPrice: 0,
              totalQuantity: 0,
              totalBillSale: 0,
              totalShipSale: 0,
              totalShipPrice: 0,
            },
          };
        }

        setTotalOrders(calculateOrderTotalsFromStats(ordersData));

        setStats({
          orders: ordersData,
          vouchers: ordersRes.data.vouchers,
          buyers: ordersRes.data.buyers,
          rating: reviewsRes.data,
          totalDiscountStats: ordersRes.data.totalDiscountStats,
          provinces: ordersRes.data.provinces,
        });
      })
      .catch((err) => console.error(err));
  }, [range]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between p-4 bg-white rounded-md border">
        <div className="flex gap-4 items-center">
          <DateRangePicker date={range} onChange={setRange} />
        </div>
        <ExportStatsExcelButton range={range} />
      </div>

      {stats && (
        <div className="space-y-4">
          <StatsSummary detail={stats.orders} />

          <div className="min-h-[350px] bg-white rounded-md border p-4">
            <StatsOrderComposedChart detail={stats.orders} mode={timeUnit} />
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4 ">
              <RatioPieChart
                title="Tỷ lệ giao hàng"
                data={[totalOrders?.complete, totalOrders?.inComplete]}
                labels={['Giao thành công', 'Giao thất bại']}
                unit="Đơn hàng"
                colors={['#15803d', '#b91c1c']}
              />
            </div>
            <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4 ">
              <RatioPieChart
                title="Tỷ lệ sản phẩm có giảm giá khi mua"
                data={[
                  stats.totalDiscountStats.discountedProducts,
                  stats.totalDiscountStats.totalProducts -
                    stats.totalDiscountStats.discountedProducts,
                ]}
                labels={['Có giảm', 'Không giảm']}
                unit="Sản phẩm"
                colors={['#0f766e', '#be185d']}
              />
            </div>
            <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4 ">
              <RatioPieChart
                title="Tỷ lệ người loại người mua trên đơn hàng"
                data={[stats.buyers.member, stats.buyers.guest]}
                labels={['Thành viên', 'Khách vãng lai']}
                colors={['#65a30d', '#374151']}
              />
            </div>
          </div>

          <div className=" min-h-[350px] bg-white rounded-md border p-4 flex flex-col md:flex-row">
            <div className="basis-1/2">
              <StatsBarChart
                title="Mã giảm giá được dùng"
                data={[
                  { name: 'Phí ship', value: stats.vouchers.typeStats.shipping },
                  { name: 'Tiền hàng', value: stats.vouchers.typeStats.order },
                ]}
                unit="Lượt dùng"
                colors={['#15803d', '#c2410c']}
              />
            </div>
            <div className="basis-1/2">
              <RatioPieChart
                title="Tỷ lệ dùng mã giảm giá trên đơn hàng"
                data={[stats.vouchers.orderUsed, totalOrders?.all]}
                labels={['Có dùng', 'Không dùng']}
                unit="Đơn hàng"
                colors={['#0f766e', '#be185d']}
              />
            </div>
          </div>

          <div className="min-h-[350px] bg-white rounded-md border p-4 flex flex-col md:flex-row">
            <div className="basis-1/2 h-[350px] ">
              <StatsBarChart
                title="Điểm đánh giá"
                data={[
                  { name: '1 Sao', value: stats.rating.s1 },
                  { name: '2 Sao', value: stats.rating.s2 },
                  { name: '3 Sao', value: stats.rating.s3 },
                  { name: '4 Sao', value: stats.rating.s4 },
                  { name: '5 Sao', value: stats.rating.s5 },
                ]}
                unit="Đánh giá"
                barSize={40}
                colors={['#b91c1c', '#dc2626', '#f97316', '#f59e0b', '#eab308']}
              />
            </div>
            <div className="basis-1/2">
              <RatioPieChart
                title="Tỷ lệ đánh giá của khách hàng thành viên sau khi nhận hàng"
                data={[stats.rating.totalOrders, stats.buyers.member - stats.rating.totalOrders]}
                labels={['Có đánh giá', 'Không đánh giá']}
                unit="Đơn hàng"
                colors={['#0f766e', '#be185d']}
              />
            </div>
          </div>
          <div className=" min-h-[350px] bg-white rounded-md border p-4 ">
            <StatsBarChart
              title="Khu vực đặt hàng"
              data={stats.provinces.map((p) => ({
                name: `${p.provinceName}`,
                value: p.count,
              }))}
              barSize={20}
              unit="Đơn hàng"
            />
          </div>
        </div>
      )}
    </div>
  );
}
