'use client';

import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  addFoodEntryToLog,
  deleteFoodEntry,
  getNutritionLogs,
  updateFoodEntry,
} from '@/app/actions/nutrition.actions';
import { AddFoodSheet } from '@/components/nutrition/add-food-sheet';
import { CalorieSummary } from '@/components/nutrition/calorie-summary';
import { MealSection } from '@/components/nutrition/meal-section';
import { NutritionHeader } from '@/components/nutrition/nutrition-header';
import { NutritionInsights } from '@/components/nutrition/nutrition-insights';
import type { Food } from '@/lib/services/nutrition.service';
import type {
  FoodEntry,
  MacroTotals,
  MealType,
  NutritionLog,
  ServingUnit,
} from '@/types/nutrition';

const MEALS: { type: MealType; title: string }[] = [
  { type: 'breakfast', title: 'Breakfast' },
  { type: 'lunch', title: 'Lunch' },
  { type: 'dinner', title: 'Dinner' },
  { type: 'snack', title: 'Snacks' },
];

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionPageClientProps {
  initialDate: Date;
  initialLogs: NutritionLog[];
  targets: NutritionTargets;
  initialError?: string;
  profileUnavailable?: boolean;
}

function foodToEntry(food: Food): Omit<FoodEntry, 'id'> {
  const servingUnit = food.selectedServingUnit ?? 'g';
  const quantity = food.selectedQuantity ?? food.servingGrams;

  return {
    name: food.name,
    servingSize: servingUnit === 'g' ? food.servingGrams : quantity,
    servingUnit,
    servingDescription: food.servingDescription || food.servingSize,
    quantity,
    grams: food.servingGrams,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    sodium: food.sodium,
    nutrientsPer100g: food.nutrientsPer100g,
  };
}

function calculateTotals(logs: NutritionLog[]): MacroTotals {
  return logs
    .flatMap((log) => log.entries)
    .reduce(
      (totals, entry) => ({
        calories: totals.calories + entry.calories,
        protein: totals.protein + entry.protein,
        carbs: totals.carbs + entry.carbs,
        fat: totals.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function shiftDate(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function NutritionPageClient({
  initialDate,
  initialLogs,
  targets,
  initialError,
  profileUnavailable = false,
}: NutritionPageClientProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [logs, setLogs] = useState<NutritionLog[]>(initialLogs);
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const totals = useMemo(() => calculateTotals(logs), [logs]);
  const entryCount = useMemo(
    () => logs.reduce((count, log) => count + log.entries.length, 0),
    [logs],
  );

  const macros = [
    {
      label: 'Protein',
      consumed: Math.round(totals.protein),
      target: targets.protein,
      color: '#7dd3fc',
    },
    { label: 'Carbs', consumed: Math.round(totals.carbs), target: targets.carbs, color: '#ffffff' },
    { label: 'Fat', consumed: Math.round(totals.fat), target: targets.fat, color: '#888888' },
  ];

  const loadDate = async (date: Date) => {
    setIsLoadingDate(true);
    setError(null);
    setSelectedDate(date);

    const result = await getNutritionLogs(date);
    if (result.success && result.data) {
      setLogs(result.data);
    } else {
      setLogs([]);
      setError(result.error ?? 'Failed to load nutrition log');
      toast.error(result.error ?? 'Failed to load nutrition log');
    }

    setIsLoadingDate(false);
  };

  const handleFoodAdded = async (food: Food) => {
    if (!activeMeal) return;

    const result = await addFoodEntryToLog({
      date: selectedDate,
      mealType: activeMeal,
      entry: foodToEntry(food),
    });

    if (!result.success || !result.data) {
      throw new Error(result.error ?? 'Failed to add food');
    }

    const savedLog = result.data;
    setLogs((currentLogs) => [...currentLogs.filter((log) => log.id !== savedLog.id), savedLog]);
    toast.success('Food added');
  };

  const handleDeleteFood = async (mealType: MealType, entryId: string) => {
    const previousLogs = logs;
    setEditingEntryId((current) => (current === entryId ? null : current));
    setLogs((currentLogs) =>
      currentLogs.map((log) =>
        log.mealType === mealType
          ? { ...log, entries: log.entries.filter((entry) => entry.id !== entryId) }
          : log,
      ),
    );

    const result = await deleteFoodEntry(entryId);

    if (result.success && result.data) {
      const savedLog = result.data;
      setLogs((currentLogs) => [...currentLogs.filter((log) => log.id !== savedLog.id), savedLog]);
      toast.success('Food deleted');
    } else {
      setLogs(previousLogs);
      setError(result.error ?? 'Failed to delete food');
      toast.error(result.error ?? 'Failed to delete food');
    }
  };

  const handleUpdateFood = async (entryId: string, quantity: number, unit: ServingUnit) => {
    const result = await updateFoodEntry({ entryId, quantity, unit });

    if (result.success && result.data) {
      const savedLog = result.data;
      setLogs((currentLogs) => [...currentLogs.filter((log) => log.id !== savedLog.id), savedLog]);
      setEditingEntryId(null);
      toast.success('Food updated');
    } else {
      setError(result.error ?? 'Failed to update food');
      toast.error(result.error ?? 'Failed to update food');
      throw new Error(result.error ?? 'Failed to update food');
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#050505]">
      <NutritionHeader
        currentCalories={Math.round(totals.calories)}
        goalCalories={targets.calories}
        dateStr={formatDate(selectedDate)}
        onPreviousDate={() => loadDate(shiftDate(selectedDate, -1))}
        onNextDate={() => loadDate(shiftDate(selectedDate, 1))}
      />

      <main className="flex-1 w-full max-w-[780px] mx-auto px-2 sm:px-4 py-4 pb-32">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/15 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {profileUnavailable && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#7dd3fc]/15 bg-[#7dd3fc]/10 p-3 text-sm text-[#bfeeff]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your profile targets are temporarily unavailable. Food logging can continue.
            </span>
          </div>
        )}

        {isLoadingDate && (
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#7dd3fc]/60" />
          </div>
        )}

        <div className="mb-6">
          <CalorieSummary
            calories={{ consumed: Math.round(totals.calories), target: targets.calories }}
            macros={macros}
          />
        </div>

        <NutritionInsights totals={totals} targets={targets} entryCount={entryCount} />

        <div className="flex flex-col gap-2">
          {MEALS.map((meal) => {
            const entries = logs
              .filter((log) => log.mealType === meal.type)
              .flatMap((log) => log.entries);
            const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

            return (
              <MealSection
                key={meal.type}
                title={meal.title}
                entries={entries}
                totalCalories={Math.round(totalCalories)}
                onAdd={() => setActiveMeal(meal.type)}
                onDelete={(entryId) => handleDeleteFood(meal.type, entryId)}
                editingEntryId={editingEntryId}
                onToggleEdit={(entryId) =>
                  setEditingEntryId((current) => (current === entryId ? null : entryId))
                }
                onUpdate={handleUpdateFood}
              />
            );
          })}
        </div>
      </main>

      <AddFoodSheet
        isOpen={Boolean(activeMeal)}
        onClose={() => setActiveMeal(null)}
        mealType={activeMeal ?? 'snack'}
        onFoodAdded={handleFoodAdded}
      />
    </div>
  );
}
