'use client';

import { AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { ChartShell } from '@/components/charts/chart-shell';

interface VolumeChartProps {
  data: { name: string; volume: number }[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] min-h-[260px] w-full min-w-0 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-neutral-500">
        No completed sets yet.
      </div>
    );
  }

  return (
    <ChartShell height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 10 }}
          dy={10}
        />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-[#1a1a1a] border border-white/10 p-2 rounded-lg shadow-xl">
                  <p className="text-white text-sm font-bold">
                    {payload[0].value} <span className="text-neutral-500 font-normal">kg</span>
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="volume"
          stroke="#7dd3fc"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVolume)"
        />
      </AreaChart>
    </ChartShell>
  );
}
