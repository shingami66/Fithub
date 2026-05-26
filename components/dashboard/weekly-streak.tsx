'use client';

import { BarChart, Bar, Cell, Tooltip } from 'recharts';
import { ChartShell } from '@/components/charts/chart-shell';
import type { WeeklyActivityPoint } from '@/lib/services/analytics.service';

export function WeeklyStreak({ data }: { data: WeeklyActivityPoint[] }) {
  if (!data.length) {
    return (
      <div className="mt-2 flex h-[260px] min-h-[260px] w-full min-w-0 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-neutral-500">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="mt-2 w-full min-w-0">
      <ChartShell height={260}>
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{
              backgroundColor: '#050505',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
            }}
            itemStyle={{ color: '#7dd3fc', fontWeight: 'bold' }}
            labelStyle={{ color: '#888', marginBottom: '4px' }}
            formatter={(value) => [`${Number(value ?? 0)} Activity`, 'Score']}
          />
          <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.active ? '#7dd3fc' : 'rgba(255,255,255,0.04)'}
                style={{
                  filter: entry.active ? 'drop-shadow(0 0 8px rgba(125,211,252,0.3))' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartShell>
      <div className="flex justify-between mt-3 px-2 text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
        {data.map((point, index) => (
          <span key={`${point.day}-${index}`} className={point.active ? 'text-white' : ''}>
            {point.day}
          </span>
        ))}
      </div>
    </div>
  );
}
