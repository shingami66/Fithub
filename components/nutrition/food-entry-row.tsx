'use client';

import { FoodEntry } from '@/types/nutrition';

interface FoodEntryRowProps {
  entry: FoodEntry;
}

export function FoodEntryRow({ entry }: FoodEntryRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.02] last:border-0 group">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white group-hover:text-[#deff9a] transition-colors">
          {entry.name}
        </span>
        <span className="text-xs text-neutral-500 mt-0.5">
          {entry.servingSize}
          {entry.servingUnit}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-white">
          {entry.calories}{' '}
          <span className="text-[10px] font-normal text-neutral-500 uppercase tracking-widest">
            kcal
          </span>
        </span>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-medium uppercase tracking-wider">
          <span className="text-neutral-400">
            P <span className="text-white">{entry.protein}</span>
          </span>
          <span className="text-neutral-400">
            C <span className="text-white">{entry.carbs}</span>
          </span>
          <span className="text-neutral-400">
            F <span className="text-white">{entry.fat}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
