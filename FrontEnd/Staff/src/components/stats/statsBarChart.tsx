'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

type BarData = {
  name: string;
  value: number;
};

type Props = {
  title: string;
  data: BarData[];
  colors?: string[];
  barSize?: number;
  unit?: string;
};

const DEFAULT_COLORS = ['#71717a', '#3f3f46'];

export default function StatsBarChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  barSize = 60,
  unit = '',
}: Props) {
  return (
    <div className="w-full h-[350px] pb-6">
      <h2 className="text font-semibold text-center mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => [`${value} ${unit}`, 'Số lượng']} />
          <Bar dataKey="value" barSize={barSize} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
