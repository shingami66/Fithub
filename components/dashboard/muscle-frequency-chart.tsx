'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface MuscleFrequencyChartProps {
  data: Record<string, number>;
}

export function MuscleFrequencyChart({ data }: MuscleFrequencyChartProps) {
  const chartData = [
    { subject: 'Chest', A: data['chest'] || 0, fullMark: 10 },
    { subject: 'Back', A: data['back'] || 0, fullMark: 10 },
    { subject: 'Legs', A: data['legs'] || 0, fullMark: 10 },
    { subject: 'Shoulders', A: data['shoulders'] || 0, fullMark: 10 },
    { subject: 'Arms', A: data['arms'] || 0, fullMark: 10 },
    { subject: 'Core', A: data['core'] || 0, fullMark: 10 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
          <Radar name="Frequency" dataKey="A" stroke="#7dd3fc" fill="#7dd3fc" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
