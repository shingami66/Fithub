'use client';

import { MacroRing } from './macro-ring';

interface CalorieSummaryProps {
  caloriesConsumed: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
}

export function CalorieSummary({
  caloriesConsumed,
  caloriesGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
}: CalorieSummaryProps) {
  const remaining = Math.max(caloriesGoal - caloriesConsumed, 0);

  return (
    <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-sm text-neutral-400 font-medium">Consumed</span>
          <span className="text-2xl font-bold text-white">
            {caloriesConsumed} <span className="text-sm font-normal text-neutral-500">kcal</span>
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-4xl font-black tracking-tight text-[#deff9a]">{remaining}</span>
          <span className="text-xs uppercase tracking-widest text-[#deff9a]/60 font-semibold mt-1">
            Remaining
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm text-neutral-400 font-medium">Goal</span>
          <span className="text-2xl font-bold text-white">
            {caloriesGoal} <span className="text-sm font-normal text-neutral-500">kcal</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <MacroRing label="Protein" value={protein} max={proteinGoal} color="#deff9a" />
        <MacroRing label="Carbs" value={carbs} max={carbsGoal} color="#9aabff" />
        <MacroRing label="Fat" value={fat} max={fatGoal} color="#ff9a9a" />
      </div>
    </div>
  );
}
