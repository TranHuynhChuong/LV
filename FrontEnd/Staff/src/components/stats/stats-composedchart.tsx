'use client';

import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
} from 'recharts';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { OrderStats } from '@/models/stats';
import { TimeUnit } from '@/app/(main)/stats/page';

type Props = {
  detail: OrderStats;
  mode: TimeUnit;
};

export default function StatsOrderComposedChart({ detail, mode }: Readonly<Props>) {
  const chartData = Object.entries(detail)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([dateStr, data]) => {
      const date = new Date(dateStr);

      const fullDate =
        mode === 'year'
          ? format(date, 'yyyy', { locale: vi })
          : mode === 'month'
          ? format(date, 'MM/yyyy', { locale: vi })
          : format(date, 'dd/MM/yyyy', { locale: vi });

      const xLabel =
        mode === 'year'
          ? format(date, 'yyyy')
          : mode === 'month'
          ? `T${date.getMonth() + 1}`
          : format(date, 'dd/MM');

      return {
        fullDate,
        xLabel,
        total: data.total.all,
      };
    });

  return (
    <div className=" h-fit">
      <h2 className=" font-semibold text-center mb-2">
        Thống kê đơn hàng đã giao (Thành công + Thất bại)
      </h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <XAxis dataKey="xLabel" />
            <YAxis yAxisId="left" width={80} allowDecimals={false} />
            <Tooltip
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
              formatter={(value: number) => ['Đơn hàng', `${value}`]}
            />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="total"
              stroke="#3f3f46"
              name="Số đơn hàng"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
