'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', calories: 2400 },
  { name: 'Tue', calories: 2600 },
  { name: 'Wed', calories: 2200 },
  { name: 'Thu', calories: 2800 },
  { name: 'Fri', calories: 2100 },
  { name: 'Sat', calories: 3000 },
  { name: 'Sun', calories: 2500 },
];

export function CaloriesTrendChart() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 10 }}
            dy={10}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1a1a1a] border border-white/10 p-2 rounded-lg shadow-xl">
                    <p className="text-white text-sm font-bold">
                      {payload[0].value} <span className="text-neutral-500 font-normal">kcal</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="calories" fill="#9aabff" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
