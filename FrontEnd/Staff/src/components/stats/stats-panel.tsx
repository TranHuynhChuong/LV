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
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

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

function getTimeUnitByRange(from: string, to: string): TimeUnit {
  const start = new Date(from);
  const end = new Date(to);

  if (!start || !end) return 'day';
  const diffInMonths =
    end.getFullYear() * 12 + end.getMonth() - (start.getFullYear() * 12 + start.getMonth());

  if (diffInMonths > 12) return 'year';
  else if (diffInMonths > 2) return 'month';
  return 'day';
}

// Helper: Lấy tất cả ngày trong khoảng
const getAllDatesInRange = (from: string, to: string): string[] => {
  if (!from || !to) return [];

  const result: string[] = [];
  const date = new Date(from);

  while (date <= new Date(to)) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    result.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }

  return result;
};

// Helper: Lấy tất cả tháng trong khoảng
const getAllMonthsInRange = (from: string, to: string): string[] => {
  if (!from || !to) return [];

  const result: string[] = [];
  const date = new Date(new Date(from).getFullYear(), new Date(from).getMonth(), 1);

  while (date <= new Date(to)) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
    date.setMonth(date.getMonth() + 1);
  }

  return result;
};

// Helper: Lấy tất cả năm trong khoảng
const getAllYearsInRange = (from: string, to: string): string[] => {
  if (!from || !to) return [];

  const startYear = new Date(from).getFullYear();
  const endYear = new Date(to).getFullYear();
  const result: string[] = [];

  for (let y = startYear; y <= endYear; y++) {
    result.push(String(y));
  }

  return result;
};

export default function StatsPanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();

  const from = searchParams.get('from') ?? startOfMonth(today).toDateString();
  const to = searchParams.get('to') ?? endOfMonth(today).toDateString();
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

  const [range, setRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  useEffect(() => {
    setRange({
      from: new Date(from),
      to: new Date(to),
    });
  }, [searchParams, from, to]);

  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');

  useEffect(() => {
    if (!from || !to) return;
    const fromDate = from ?? undefined;
    const toDate = to ?? undefined;

    const currentUnit = getTimeUnitByRange(from, to);
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

    Promise.all([fetchOrders, fetchReviews]).then(([ordersRes, reviewsRes]) => {
      const ordersData = ordersRes.data.orders;
      let timeKeys: string[] = [];
      switch (currentUnit) {
        case 'day':
          timeKeys = getAllDatesInRange(from, to);
          break;
        case 'month':
          timeKeys = getAllMonthsInRange(from, to);
          break;
        case 'year':
          timeKeys = getAllYearsInRange(from, to);
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
    });
  }, [from, to]);

  const handleSearch = () => {
    const search = new URLSearchParams();
    if (range?.from && range.to) {
      search.set('from', startOfDay(range.from).toDateString());
      search.set('to', endOfDay(range.to).toDateString());
    }

    router.replace(`/stats?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    if (from && to) {
      search.set('from', startOfMonth(today).toDateString());
      search.set('to', endOfMonth(today).toDateString());
    }
    router.replace(`/stats?${search.toString()}`);
  };

  return (
    <div className="p-6 space-y-2">
      <div className="flex justify-between p-4 bg-white border rounded-md gap-2">
        <DateRangePicker date={range} onChange={setRange} />

        <div className="flex justify-end flex-1 gap-2">
          <Button onClick={handleSearch} className="cursor-pointer">
            <Search className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
          <Button variant="outline" onClick={handleClearSearch} className="cursor-pointer">
            <RotateCcw className="w-4 h-4 mr-1" />
            Đặt lại
          </Button>
        </div>

        <ExportStatsExcelButton range={range} />
      </div>

      {stats && <StatsChart stats={stats} timeUnit={timeUnit} totalOrders={totalOrders} />}
    </div>
  );
}
