'use client';

import { Flame } from 'lucide-react';

interface Macro {
  label: string;
  consumed: number;
  target: number;
  color: string;
  icon?: React.ReactNode;
}

interface CalorieSummaryProps {
  calories: { consumed: number; target: number };
  macros: Macro[];
}

export function CalorieSummary({ calories, macros }: CalorieSummaryProps) {
  return (
    <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 flex flex-col gap-5">
      {/* Top Bar: Calories */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">
            Energy
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{calories.consumed}</span>
            <span className="text-xs font-bold text-neutral-500">/ {calories.target} kcal</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-[#7dd3fc]/20 flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#7dd3fc]"
              strokeDasharray={`${(calories.consumed / calories.target) * 100}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <Flame className="w-4 h-4 text-[#7dd3fc]" />
        </div>
      </div>

      {/* Dense Horizontal Macros */}
      <div className="grid grid-cols-4 gap-2">
        {macros.map((m) => (
          <div
            key={m.label}
            className="bg-white/[0.02] rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5"
          >
            <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
              {m.icon}
              {m.label}
            </div>
            <div className="text-xs font-black text-white">{m.consumed}g</div>
            <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((m.consumed / m.target) * 100, 100)}%`,
                  backgroundColor: m.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
