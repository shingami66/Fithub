'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OnboardingInput } from '@/lib/validations/onboarding';

interface WeeklyTargetStepProps {
  fitnessGoal?: OnboardingInput['fitnessGoal'];
  selectedTarget: OnboardingInput['weeklyWeightChange'] | null;
  onNext: (target: OnboardingInput['weeklyWeightChange']) => void;
  onBack: () => void;
}

const TARGETS = [
  {
    id: 'lose_0_25',
    label: 'Lose 0.25 kg/week',
    description: 'Gentle deficit',
    icon: TrendingDown,
  },
  {
    id: 'lose_0_5',
    label: 'Lose 0.5 kg/week',
    description: 'Moderate deficit',
    icon: TrendingDown,
  },
  {
    id: 'lose_1',
    label: 'Lose 1 kg/week',
    description: 'Aggressive deficit',
    icon: AlertTriangle,
  },
  {
    id: 'maintain',
    label: 'Maintain',
    description: 'No weight-change target',
    icon: Minus,
  },
  {
    id: 'gain_0_25',
    label: 'Gain 0.25 kg/week',
    description: 'Lean surplus',
    icon: TrendingUp,
  },
  {
    id: 'gain_0_5',
    label: 'Gain 0.5 kg/week',
    description: 'Stronger surplus',
    icon: TrendingUp,
  },
] as const;

export function WeeklyTargetStep({
  fitnessGoal,
  selectedTarget,
  onNext,
  onBack,
}: WeeklyTargetStepProps) {
  const defaultTarget = useMemo<OnboardingInput['weeklyWeightChange']>(() => {
    if (fitnessGoal === 'lose_fat') return 'lose_0_5';
    if (fitnessGoal === 'build_muscle') return 'gain_0_25';
    return 'maintain';
  }, [fitnessGoal]);
  const [target, setTarget] = useState<OnboardingInput['weeklyWeightChange'] | null>(
    selectedTarget ?? defaultTarget,
  );

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          Weekly target
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Pick the pace that should shape your daily calories.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TARGETS.map(({ id, label, description, icon: Icon }) => {
          const isSelected = target === id;
          return (
            <button
              key={id}
              onClick={() => setTarget(id)}
              className={cn(
                'flex min-h-[96px] w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300',
                isSelected
                  ? 'border-[#7dd3fc]/30 bg-[#7dd3fc]/[0.04] shadow-[0_0_20px_rgba(125,211,252,0.05)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                  isSelected ? 'bg-[#7dd3fc]/10 text-[#7dd3fc]' : 'bg-white/5 text-neutral-400',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn('font-medium', isSelected ? 'text-white' : 'text-neutral-300')}>
                  {label}
                </p>
                <p className="text-xs text-neutral-500">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {target === 'lose_1' && (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Losing 1 kg per week may be aggressive. Monitor recovery and choose a smaller target if
          performance or hunger becomes hard to manage.
        </div>
      )}

      <div className="sticky bottom-0 mt-8 flex gap-3 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={onBack}
          className="rounded-xl border border-white/[0.06] bg-transparent px-6 py-4 text-sm font-medium text-neutral-400 transition-all hover:bg-white/[0.03] hover:text-white"
        >
          Back
        </button>
        <button
          onClick={() => target && onNext(target)}
          disabled={!target}
          className="flex-1 rounded-xl border border-[#7dd3fc]/40 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-[#7dd3fc]/70 hover:bg-white/[0.07] disabled:opacity-30 disabled:hover:border-[#7dd3fc]/40 disabled:hover:bg-white/[0.04]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
