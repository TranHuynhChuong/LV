'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Props = {
  title: string;
  data: [number, number];
  labels: [string, string];
  unit?: string;
  colors?: [string, string];
};

const DEFAULT_COLORS: [string, string] = ['#3f3f46', '#71717b'];

export default function RatioPieChart({ title, data, labels, unit = '', colors }: Props) {
  const total = data[0] + data[1];
  const chartData = [
    { name: labels[0], value: data[0] },
    { name: labels[1], value: data[1] },
  ];
  const colorPalette = colors ?? DEFAULT_COLORS;

  return (
    <div className="h-fit">
      <h2 className="text font-semibold text-center mb-2">{title}</h2>

      <div className="h-[300px]">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center pt-16">Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                label={({ value = 0 }) => `${((value / total) * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={colorPalette[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} ${unit}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
