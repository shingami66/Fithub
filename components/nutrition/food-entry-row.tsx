'use client';

import { MoreHorizontal } from 'lucide-react';
import { FoodEntry } from '@/types/nutrition';

interface FoodEntryRowProps {
  entry: FoodEntry;
}

export function FoodEntryRow({ entry }: FoodEntryRowProps) {
  return (
    <div className="group flex items-center justify-between py-2 px-3 hover:bg-white/[0.02] transition-colors rounded-xl -mx-3">
      <div className="flex items-center gap-3 flex-1">
        {/* Thumb */}
        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-neutral-500 uppercase">
            {entry.name.slice(0, 2)}
          </span>
        </div>

        {/* Name & Serving */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-bold text-white truncate">{entry.name}</span>
          <span className="text-xs text-neutral-500 mt-0.5">
            {entry.servingSize}
            {entry.servingUnit || 'g'} • {entry.protein}g P
          </span>
        </div>
      </div>

      {/* Calories & Action */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm font-black text-[#7dd3fc]">{entry.calories}</span>
        <button className="text-neutral-600 hover:text-white p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
