'use client';

import { Plus } from 'lucide-react';
import { FoodEntryRow } from './food-entry-row';
import { FoodEntry } from '@/types/nutrition';

interface MealSectionProps {
  title: string;
  entries: FoodEntry[];
  totalCalories: number;
}

export function MealSection({ title, entries, totalCalories }: MealSectionProps) {
  return (
    <div className="bg-[#040816] border border-white/[0.04] rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.02] pb-3">
        <h3 className="text-sm font-bold text-white capitalize">{title}</h3>
        <span className="text-xs font-bold text-neutral-400">{totalCalories} kcal</span>
      </div>

      {/* Entries */}
      <div className="flex flex-col">
        {entries.map((entry) => (
          <FoodEntryRow key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Add Button */}
      <button className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-[#7dd3fc] bg-[#7dd3fc]/[0.03] hover:bg-[#7dd3fc]/10 rounded-xl transition-colors active:scale-[0.98]">
        <Plus className="w-3.5 h-3.5" />
        ADD FOOD
      </button>
    </div>
  );
}
