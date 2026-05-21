'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, isToday, addDays, subDays } from 'date-fns';

interface NutritionHeaderProps {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
}

export function NutritionHeader({ currentDate, onChangeDate }: NutritionHeaderProps) {
  return (
    <div className="sticky top-0 z-40 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-full bg-[#deff9a]/10 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-[#deff9a]" />
          </div>
          <h1 className="text-lg font-bold">Nutrition</h1>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.03] rounded-full p-1 border border-white/[0.05]">
          <button
            onClick={() => onChangeDate(subDays(currentDate, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white px-2 min-w-[100px] text-center">
            {isToday(currentDate) ? 'Today' : format(currentDate, 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => onChangeDate(addDays(currentDate, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
