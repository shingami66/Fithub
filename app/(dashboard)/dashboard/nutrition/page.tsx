'use client';

import { useState } from 'react';
import { NutritionHeader } from '@/components/nutrition/nutrition-header';
import { CalorieSummary } from '@/components/nutrition/calorie-summary';
import { MealSection } from '@/components/nutrition/meal-section';
import { FoodEntry, MealType } from '@/types/nutrition';

// Mock goals for Sprint 8 demo
const GOALS = {
  calories: 2400,
  protein: 180,
  carbs: 250,
  fat: 75,
};

export default function NutritionPage() {
  const [date, setDate] = useState(new Date());

  // Optimistic State
  const [entries, setEntries] = useState<Record<MealType, FoodEntry[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    pre_workout: [],
    post_workout: [],
  });

  const handleAddEntry = (meal: MealType, entry: FoodEntry) => {
    setEntries((prev) => ({
      ...prev,
      [meal]: [...prev[meal], entry],
    }));
  };

  // Calculate totals
  const allEntries = Object.values(entries).flat();
  const consumed = allEntries.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fat: acc.fat + curr.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="flex flex-col min-h-dvh bg-[#050505]">
      <NutritionHeader currentDate={date} onChangeDate={setDate} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 py-6 pb-40 flex flex-col gap-6">
        <CalorieSummary
          caloriesConsumed={consumed.calories}
          caloriesGoal={GOALS.calories}
          protein={consumed.protein}
          proteinGoal={GOALS.protein}
          carbs={consumed.carbs}
          carbsGoal={GOALS.carbs}
          fat={consumed.fat}
          fatGoal={GOALS.fat}
        />

        <div className="flex flex-col gap-4">
          <MealSection
            title="Breakfast"
            entries={entries.breakfast}
            onAddEntry={(e) => handleAddEntry('breakfast', e)}
          />
          <MealSection
            title="Lunch"
            entries={entries.lunch}
            onAddEntry={(e) => handleAddEntry('lunch', e)}
          />
          <MealSection
            title="Dinner"
            entries={entries.dinner}
            onAddEntry={(e) => handleAddEntry('dinner', e)}
          />
          <MealSection
            title="Snacks"
            entries={entries.snack}
            onAddEntry={(e) => handleAddEntry('snack', e)}
          />
        </div>
      </main>
    </div>
  );
}
