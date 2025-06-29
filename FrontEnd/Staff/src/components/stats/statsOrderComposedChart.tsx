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

type Props = {
  detail: OrderStats;
  mode: 'month' | 'year'; // ⬅️ Thêm để xác định hiển thị theo ngày hay tháng
};

export default function StatsOrderComposedChart({ detail, mode }: Readonly<Props>) {
  const chartData = Object.entries(detail)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([dateStr, data]) => {
      const date = new Date(dateStr);

      return {
        fullDate:
          mode === 'year'
            ? format(date, 'MM/yyyy', { locale: vi })
            : format(date, 'dd/MM/yyyy', { locale: vi }),
        xLabel: mode === 'year' ? `T${date.getMonth() + 1}` : date.getDate(),
        total: data.total.all,
      };
    });

  return (
    <div className=" h-fit">
      <h2 className="text-lg font-semibold text-center mb-2">
        {' '}
        {mode === 'year' ? 'Đơn hàng trong năm' : 'Đơn hàng trong tháng'}
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
