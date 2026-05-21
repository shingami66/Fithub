'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Chest', A: 120, fullMark: 150 },
  { subject: 'Back', A: 98, fullMark: 150 },
  { subject: 'Legs', A: 86, fullMark: 150 },
  { subject: 'Shoulders', A: 99, fullMark: 150 },
  { subject: 'Arms', A: 85, fullMark: 150 },
  { subject: 'Core', A: 65, fullMark: 150 },
];

export function MuscleFrequencyChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
          <Radar name="Frequency" dataKey="A" stroke="#deff9a" fill="#deff9a" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
