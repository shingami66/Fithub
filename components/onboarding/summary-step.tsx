'use client';

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { calculateBMR, calculateDailyCalories, calculateMacros } from '@/lib/utils/calculations';
import type { OnboardingInput } from '@/lib/validations/onboarding';
import { cn } from '@/lib/utils/cn';

interface SummaryStepProps {
  formData: OnboardingInput;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function SummaryStep({ formData, onSubmit, onBack, isSubmitting }: SummaryStepProps) {
  const results = useMemo(() => {
    // We can assume formData is fully populated at this step
    const bmr = calculateBMR(formData.gender, formData.age, formData.heightCm, formData.weightKg);
    const calories = calculateDailyCalories(bmr, formData.activityLevel, formData.fitnessGoal);
    const macros = calculateMacros(calories, formData.fitnessGoal);

    return { calories, macros };
  }, [formData]);

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          Your personalized plan
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Based on your profile, here are your daily targets.
        </p>
      </div>

      <div className="space-y-4">
        {/* Calories Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-[#7dd3fc]/5 blur-3xl" />
          <p className="relative text-sm font-medium text-neutral-400">Daily Target</p>
          <div className="relative mt-2 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold tracking-tighter text-white">
              {results.calories}
            </span>
            <span className="text-sm font-medium text-neutral-500">kcal</span>
          </div>
        </div>

        {/* Macros Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="mb-5 text-sm font-medium text-neutral-400">Macros Breakdown</p>
          <div className="space-y-4">
            <MacroRow label="Protein" value={results.macros.protein} color="bg-[#7dd3fc]/70" />
            <MacroRow label="Carbs" value={results.macros.carbs} color="bg-sky-400/70" />
            <MacroRow label="Fat" value={results.macros.fat} color="bg-amber-400/70" />
          </div>
        </div>

        {/* Summary Badges */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3 py-2 text-center text-xs text-neutral-500 capitalize">
            Goal: {formData.fitnessGoal.replace('_', ' ')}
          </div>
          <div className="flex-1 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3 py-2 text-center text-xs text-neutral-500 capitalize">
            Activity: {formData.activityLevel.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 flex gap-3 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-xl border border-white/[0.06] bg-transparent px-6 py-4 text-sm font-medium text-neutral-400 transition-all hover:bg-white/[0.03] hover:text-white disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#7dd3fc]/50 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-[#7dd3fc]/80 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(125,211,252,0.1)] disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#7dd3fc]" />
          ) : (
            'Start My Journey'
          )}
        </button>
      </div>
    </div>
  );
}

function MacroRow({ label, value, color }: { label: string; value: number; color: string }) {
  // Normalize visually by calculating a max value for the bars (e.g. 250g)
  // This is just a visual trick so the bars aren't all 100% wide
  const percentage = Math.min((value / 250) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs text-neutral-400">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-medium text-white">{value}g</span>
    </div>
  );
}
