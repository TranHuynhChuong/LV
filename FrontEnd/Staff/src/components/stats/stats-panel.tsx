'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios-client';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { Stats } from '@/models/stats';
import { DateRange } from 'react-day-picker';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import DateRangePicker from '@/components/utils/date-range-picker';
import ExportStatsExcelButton from '@/components/stats/stats-export';
import StatsChartLoading from './stats-chart-loading';
import dynamic from 'next/dynamic';

const StatsChart = dynamic(() => import('./stats-chart'), {
  loading: () => <StatsChartLoading />,
  ssr: false,
});

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

function getTimeUnitByRange(range: DateRange): TimeUnit {
  const start = range.from;
  const end = range.to;

  if (!start || !end) return 'day';
  const diffInMonths =
    end.getFullYear() * 12 + end.getMonth() - (start.getFullYear() * 12 + start.getMonth());

  if (diffInMonths > 2 && diffInMonths < 12) return 'month';
  else if (diffInMonths > 12) return 'year';
  return 'day';
}

// Helper: Lấy tất cả ngày trong khoảng
const getAllDatesInRange = (range: DateRange): string[] => {
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
const getAllMonthsInRange = (range: DateRange): string[] => {
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
const getAllYearsInRange = (range: DateRange): string[] => {
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

export default function StatsPanel() {
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

    const currentUnit = getTimeUnitByRange(range);
    setTimeUnit(currentUnit);

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

        switch (currentUnit) {
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
      <div className="flex items-center justify-between p-4 bg-white border rounded-md">
        <div className="flex items-center gap-4">
          <DateRangePicker date={range} onChange={setRange} />
        </div>
        <ExportStatsExcelButton range={range} />
      </div>

      {stats && <StatsChart stats={stats} timeUnit={timeUnit} totalOrders={totalOrders} />}
    </div>
  );
}
