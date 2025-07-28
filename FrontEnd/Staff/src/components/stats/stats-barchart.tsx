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

type BarData = Record<string, number | string | null | undefined>;

type Props = {
  title: string;
  data: BarData[];
  colors?: string[];
  barSize?: number;
  unit?: string;
  xKey?: string;
  yKey?: string;
  vertical?: boolean;
};

const DEFAULT_COLORS = ['#71717a', '#3f3f46'];

export default function StatsBarChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  barSize = 60,
  unit = '',
  xKey = 'value',
  yKey = 'name',
  vertical = false,
}: Readonly<Props>) {
  return (
    <div className="w-full h-[350px] pb-6">
      <h2 className="mb-2 font-semibold text-center text">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={vertical ? 'vertical' : 'horizontal'}
          margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {vertical ? (
            <>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey={yKey} />
            </>
          ) : (
            <>
              <XAxis dataKey={yKey} />
              <YAxis allowDecimals={false} />
            </>
          )}

          <Tooltip
            formatter={(value: number) => [`${value} ${unit}`, 'Số lượng']}
            labelFormatter={(label) => label}
          />
          <Bar dataKey={xKey} barSize={barSize} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
