'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import StatsOrderComposedChart from '@/components/stats/statsOrderComposedChart';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import StatsSummary from '@/components/stats/statsSumary';
import RatioPieChart from '@/components/stats/statsRatioPieChart';
import StatsBarChart from '@/components/stats/statsBarChart';
import { Stats } from '@/models/stats';
import ExportStatsExcelButton from '@/components/stats/statsExportFile';

const START_YEAR = 2020;
const CURRENT_YEAR = new Date().getFullYear();

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

// Helper: Lấy tất cả ngày trong tháng
const getAllDatesInMonth = (year: number, month: number): string[] => {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Helper: Lấy tất cả tháng trong năm
const getAllMonthsInYear = (year: number): string[] => {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
};

export default function StatsPage() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Thống kê bán hàng' }]);
  }, [setBreadcrumbs]);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [modeStat, setModeStat] = useState<'month' | 'year'>('month');
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalOrders, setTotalOrders] = useState<{
    all: number;
    complete: number;
    inComplete: number;
    canceled: number;
  }>({ all: 0, complete: 0, inComplete: 0, canceled: 0 });

  const [provincesData, setProvincesData] = useState<{ code: number; name: string }[]>([]);

  useEffect(() => {
    async function fetchProvinces() {
      const res = await api.get('/address/0');
      const data = res.data;
      const mapped = data.map((item: { T_id: number; T_ten: string }) => ({
        code: item.T_id,
        name: item.T_ten,
      }));

      setProvincesData(mapped);
    }
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (provincesData.length === 0) return;
    const isYearMode = month === 0;

    setModeStat(isYearMode ? 'year' : 'month');

    const fetchOrders = isYearMode
      ? api.get(`/orders/stats/year/${year}`)
      : api.get(`/orders/stats/month/${year}/${month}`);
    const fetchReviews = isYearMode
      ? api.get(`/reviews/stats/year/${year}`)
      : api.get(`/reviews/stats/month/${year}/${month}`);

    Promise.all([fetchOrders, fetchReviews])
      .then(([ordersRes, reviewsRes]) => {
        const ordersData = ordersRes.data.orders;
        const timeKeys = isYearMode ? getAllMonthsInYear(year) : getAllDatesInMonth(year, month);

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

        const provincesRaw = ordersRes.data.provinces as { provinceId: number; count: number }[];

        const mappedProvinces = provincesData.map((province) => {
          const found = provincesRaw.find((item) => item.provinceId === province.code);
          return {
            code: province.code,
            name: province.name,
            count: found ? found.count : 0,
          };
        });

        setStats({
          orders: ordersData,
          vouchers: ordersRes.data.vouchers,
          buyers: ordersRes.data.buyers,
          rating: reviewsRes.data,
          totalDiscountStats: ordersRes.data.totalDiscountStats,

          provinces: mappedProvinces,
        });
      })
      .catch((err) => console.error(err));
  }, [year, month, provincesData]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between p-4 bg-white rounded-md border">
        <div className="flex gap-4 items-center">
          {/* Năm */}
          <div>
            <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => {
                  const y = CURRENT_YEAR - i;
                  return (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Tháng */}
          <div>
            <Select value={String(month)} onValueChange={(val) => setMonth(Number(val))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả</SelectItem>
                {Array.from({ length: 12 }, (_, i) => {
                  const m = i + 1;
                  return (
                    <SelectItem key={m} value={String(m)}>
                      Tháng {m}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ExportStatsExcelButton year={year} month={month} />
      </div>

      {stats && (
        <div className="space-y-4">
          <StatsSummary detail={stats.orders} />
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="basis-2/3 min-h-[350px] bg-white rounded-md border p-4">
              <StatsOrderComposedChart detail={stats.orders} mode={modeStat} />
            </div>

            <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4">
              <RatioPieChart
                title="Tỷ lệ giao hàng"
                data={[totalOrders?.complete, totalOrders?.inComplete]}
                labels={['Giao thành công', 'Giao thất bại']}
                unit="Đơn hàng"
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4">
              <RatioPieChart
                title="Tỷ lệ sản phẩm có giảm giá khi mua"
                data={[
                  stats.totalDiscountStats.discountedProducts,
                  stats.totalDiscountStats.totalProducts -
                    stats.totalDiscountStats.discountedProducts,
                ]}
                labels={['Có giảm', 'Không giảm']}
                unit="Sản phẩm"
              />
            </div>
            <div className="basis-2/3 min-h-[350px] bg-white rounded-md border p-4 flex flex-col md:flex-row">
              <div className="basis-1/2">
                <StatsBarChart
                  title="Mã giảm giá được dùng"
                  data={[
                    { name: 'Mã giảm phí ship', value: stats.vouchers.typeStats.shipping },
                    { name: 'Mã giảm đơn hàng', value: stats.vouchers.typeStats.order },
                  ]}
                  unit="Lượt dùng"
                />
              </div>
              <div className="basis-1/2">
                <RatioPieChart
                  title="Tỷ lệ dùng mã giảm giá trên đơn hàng"
                  data={[stats.vouchers.orderUsed, totalOrders?.all]}
                  labels={['Có dùng', 'Không dùng']}
                  unit="Đơn hàng"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4">
              <RatioPieChart
                title="Tỷ lệ người loại người mua trên đơn hàng"
                data={[stats.buyers.member, stats.buyers.guest]}
                labels={['Thành viên', 'Khách vãng lai']}
              />
            </div>
            <div className="basis-2/3 min-h-[350px] bg-white rounded-md border p-4 flex flex-col md:flex-row">
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
                />
              </div>
              <div className="basis-1/2">
                <RatioPieChart
                  title="Tỷ lệ đánh giá của khách hàng thành viên sau khi nhận hàng"
                  data={[stats.rating.totalOrders, stats.buyers.member - stats.rating.totalOrders]}
                  labels={['Có đánh giá', 'Không đánh giá']}
                  unit="Đơn hàng"
                />
              </div>
            </div>
          </div>
          <div className=" min-h-[350px] bg-white rounded-md border p-4 ">
            <StatsBarChart
              title="Khu vực đặt hàng"
              data={stats.provinces.map((p) => ({
                name: `${p.name}`,
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
