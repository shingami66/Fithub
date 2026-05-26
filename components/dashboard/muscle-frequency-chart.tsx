'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { ChartShell } from '@/components/charts/chart-shell';

interface MuscleFrequencyChartProps {
  data: Record<string, number>;
}

export function MuscleFrequencyChart({ data }: MuscleFrequencyChartProps) {
  const hasData = Object.values(data).some((value) => value > 0);
  const chartData = [
    { subject: 'Chest', A: data['chest'] || 0, fullMark: 10 },
    { subject: 'Back', A: data['back'] || 0, fullMark: 10 },
    { subject: 'Legs', A: data['legs'] || 0, fullMark: 10 },
    { subject: 'Shoulders', A: data['shoulders'] || 0, fullMark: 10 },
    { subject: 'Arms', A: data['arms'] || 0, fullMark: 10 },
    { subject: 'Core', A: data['core'] || 0, fullMark: 10 },
  ];

  if (!hasData) {
    return (
      <div className="flex h-[260px] min-h-[260px] w-full min-w-0 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-neutral-500">
        No muscle frequency data yet.
      </div>
    );
  }

  return (
    <ChartShell height={260}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
        <Radar name="Frequency" dataKey="A" stroke="#7dd3fc" fill="#7dd3fc" fillOpacity={0.3} />
      </RadarChart>
    </ChartShell>
  );
}
