'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface NutritionHeaderProps {
  currentCalories: number;
  goalCalories: number;
  dateStr: string;
}

export function NutritionHeader({ currentCalories, goalCalories, dateStr }: NutritionHeaderProps) {
  const remaining = goalCalories - currentCalories;

  return (
    <div className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.04] safe-top">
      <div className="max-w-[780px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Date Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.05]">
          <button className="p-1 hover:bg-white/[0.05] rounded-md transition-colors">
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-[#7dd3fc]" />
            <span className="text-xs font-bold text-white whitespace-nowrap">{dateStr}</span>
          </div>
          <button className="p-1 hover:bg-white/[0.05] rounded-md transition-colors">
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Mini Goal Status */}
        <div className="flex flex-col items-end">
          <div className="text-xs font-bold text-white tracking-tight">
            {currentCalories}{' '}
            <span className="text-neutral-500 font-medium">/ {goalCalories} kcal</span>
          </div>
          <div className="text-[10px] text-[#7dd3fc] font-medium tracking-wide">
            {remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
          </div>
        </div>
      </div>
    </div>
  );
}
