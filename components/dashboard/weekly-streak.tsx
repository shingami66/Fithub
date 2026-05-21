'use client';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip } from 'recharts';

const data = [
  { day: 'M', active: true, score: 80 },
  { day: 'T', active: true, score: 95 },
  { day: 'W', active: false, score: 10 },
  { day: 'T', active: true, score: 70 },
  { day: 'F', active: true, score: 100 },
  { day: 'S', active: false, score: 5 },
  { day: 'S', active: true, score: 60 },
];

export function WeeklyStreak() {
  return (
    <div className="h-40 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{
              backgroundColor: '#050505',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
            }}
            itemStyle={{ color: '#deff9a', fontWeight: 'bold' }}
            labelStyle={{ color: '#888', marginBottom: '4px' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} Score`, 'Activity']}
          />
          <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.active ? '#deff9a' : 'rgba(255,255,255,0.04)'}
                style={{
                  filter: entry.active ? 'drop-shadow(0 0 8px rgba(222,255,154,0.3))' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-3 px-2 text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
        {data.map((d, i) => (
          <span key={i} className={d.active ? 'text-white' : ''}>
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
