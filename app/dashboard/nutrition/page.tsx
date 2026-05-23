'use client';

import { NutritionHeader } from '@/components/nutrition/nutrition-header';
import { CalorieSummary } from '@/components/nutrition/calorie-summary';
import { MealSection } from '@/components/nutrition/meal-section';
import { NutritionInsights } from '@/components/nutrition/nutrition-insights';
import { FoodEntry } from '@/types/nutrition';

const mockCalories = { consumed: 1850, target: 2400 };
const mockMacros = [
  { label: 'Protein', consumed: 140, target: 180, color: '#7dd3fc' },
  { label: 'Carbs', consumed: 150, target: 220, color: '#ffffff' },
  { label: 'Fat', consumed: 60, target: 75, color: '#888888' },
  { label: 'Fiber', consumed: 22, target: 30, color: '#444444' },
];

const mockBreakfast: FoodEntry[] = [
  {
    id: '1',
    name: 'Oats',
    servingSize: 60,
    servingUnit: 'g',
    calories: 233,
    protein: 8,
    carbs: 41,
    fat: 4,
  },
  {
    id: '2',
    name: 'Banana',
    servingSize: 120,
    servingUnit: 'g',
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
  },
  {
    id: '3',
    name: 'Whey Protein Isolate',
    servingSize: 30,
    servingUnit: 'g',
    calories: 110,
    protein: 25,
    carbs: 2,
    fat: 0,
  },
];

const mockLunch: FoodEntry[] = [
  {
    id: '4',
    name: 'Chicken Breast',
    servingSize: 200,
    servingUnit: 'g',
    calories: 330,
    protein: 62,
    carbs: 0,
    fat: 7,
  },
  {
    id: '5',
    name: 'Jasmine Rice',
    servingSize: 150,
    servingUnit: 'g',
    calories: 195,
    protein: 4,
    carbs: 43,
    fat: 0,
  },
  {
    id: '6',
    name: 'Avocado',
    servingSize: 50,
    servingUnit: 'g',
    calories: 80,
    protein: 1,
    carbs: 4,
    fat: 7,
  },
];

const mockDinner: FoodEntry[] = [
  {
    id: '7',
    name: 'Atlantic Salmon',
    servingSize: 180,
    servingUnit: 'g',
    calories: 374,
    protein: 36,
    carbs: 0,
    fat: 23,
  },
  {
    id: '8',
    name: 'Sweet Potatoes',
    servingSize: 200,
    servingUnit: 'g',
    calories: 172,
    protein: 3,
    carbs: 40,
    fat: 0,
  },
];

const mockSnacks: FoodEntry[] = [
  {
    id: '9',
    name: 'Greek Yogurt 0%',
    servingSize: 150,
    servingUnit: 'g',
    calories: 80,
    protein: 15,
    carbs: 5,
    fat: 0,
  },
  {
    id: '10',
    name: 'Almonds',
    servingSize: 30,
    servingUnit: 'g',
    calories: 170,
    protein: 6,
    carbs: 6,
    fat: 15,
  },
];

const sumCals = (entries: FoodEntry[]) => entries.reduce((acc, curr) => acc + curr.calories, 0);

export default function NutritionPage() {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-dvh bg-[#050505]">
      <NutritionHeader
        currentCalories={mockCalories.consumed}
        goalCalories={mockCalories.target}
        dateStr={dateStr}
      />

      <main className="flex-1 w-full max-w-[780px] mx-auto px-2 sm:px-4 py-4 pb-32">
        <div className="mb-6">
          <CalorieSummary calories={mockCalories} macros={mockMacros} />
        </div>

        <NutritionInsights />

        <div className="flex flex-col gap-2">
          <MealSection
            title="Breakfast"
            entries={mockBreakfast}
            totalCalories={sumCals(mockBreakfast)}
          />
          <MealSection title="Lunch" entries={mockLunch} totalCalories={sumCals(mockLunch)} />
          <MealSection title="Dinner" entries={mockDinner} totalCalories={sumCals(mockDinner)} />
          <MealSection title="Snacks" entries={mockSnacks} totalCalories={sumCals(mockSnacks)} />
        </div>
      </main>
    </div>
  );
}
