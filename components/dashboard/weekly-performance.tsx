'use client';

import { Trophy, TrendingUp } from 'lucide-react';

export function WeeklyPerformance({ streak = 0 }: { streak?: number }) {
  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-neutral-400">Weekly Performance</h3>
        <Trophy className="w-4 h-4 text-[#ffe59a]" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-white">{streak}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mt-1">
            Wk Streak
          </span>
        </div>

        <div className="w-px h-12 bg-white/5 mx-4" />

        <div className="flex flex-col">
          <span className="text-3xl font-bold text-white">
            12.4<span className="text-lg text-neutral-500 font-medium">k</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mt-1">
            Volume (kg)
          </span>
        </div>

        <div className="w-px h-12 bg-white/5 mx-4" />

        <div className="flex flex-col">
          <span className="text-3xl font-bold text-[#7dd3fc] flex items-center gap-1">
            +12% <TrendingUp className="w-4 h-4" />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mt-1">
            Vs Last Wk
          </span>
        </div>
      </div>
    </div>
  );
}
