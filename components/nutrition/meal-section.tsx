'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FoodEntry } from '@/types/nutrition';
import { FoodEntity } from '@/types/food';
import { FoodEntryRow } from './food-entry-row';
import { AddFoodSheet } from './add-food-sheet';

interface MealSectionProps {
  title: string;
  entries: FoodEntry[];
  onAddEntry: (entry: FoodEntry) => void;
}

export function MealSection({ title, entries, onAddEntry }: MealSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  const handleAdd = (food: FoodEntity) => {
    onAddEntry({
      id: Math.random().toString(), // Mock ID generation
      name: food.name,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    setIsAdding(false);
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.02]">
        <h3 className="text-sm font-bold text-white capitalize">{title}</h3>
        <span className="text-sm font-medium text-[#deff9a]">
          {totalCalories}{' '}
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-normal">
            kcal
          </span>
        </span>
      </div>

      <div className="p-4 flex flex-col gap-1">
        {entries.map((entry) => (
          <FoodEntryRow key={entry.id} entry={entry} />
        ))}
        {entries.length === 0 && (
          <div className="text-center py-4 text-xs text-neutral-600 font-medium italic">
            No entries yet
          </div>
        )}
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="w-full p-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#deff9a] hover:bg-[#deff9a]/5 transition-colors border-t border-white/[0.02]"
      >
        <Plus className="w-4 h-4" />
        ADD FOOD
      </button>

      {isAdding && (
        <AddFoodSheet mealName={title} onClose={() => setIsAdding(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
