'use client';

import { useState } from 'react';
import { Flame, Scale, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GoalStepProps {
  selectedGoal: string | null;
  onNext: (goal: string) => void;
}

const GOALS = [
  {
    id: 'lose_fat',
    label: 'Lose Fat',
    description: 'Caloric deficit for fat loss',
    icon: Flame,
  },
  {
    id: 'maintain',
    label: 'Maintain',
    description: 'Keep current weight and optimize health',
    icon: Scale,
  },
  {
    id: 'build_muscle',
    label: 'Build Muscle',
    description: 'Caloric surplus for muscle growth',
    icon: Dumbbell,
  },
];

export function GoalStep({ selectedGoal, onNext }: GoalStepProps) {
  const [goal, setGoal] = useState<string | null>(selectedGoal);

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          What&apos;s your goal?
        </h2>
        <p className="mt-2 text-sm text-neutral-500">This helps us calculate your daily targets.</p>
      </div>

      <div className="space-y-3">
        {GOALS.map(({ id, label, description, icon: Icon }) => {
          const isSelected = goal === id;
          return (
            <button
              key={id}
              onClick={() => setGoal(id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-300',
                isSelected
                  ? 'border border-[#deff9a]/30 bg-[#deff9a]/[0.04] shadow-[0_0_20px_rgba(222,255,154,0.05)]'
                  : 'border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                  isSelected ? 'bg-[#deff9a]/10 text-[#deff9a]' : 'bg-white/5 text-neutral-400',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
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

      <div className="sticky bottom-0 mt-8 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => goal && onNext(goal)}
          disabled={!goal}
          className="w-full rounded-xl border border-[#deff9a]/40 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-[#deff9a]/70 hover:bg-white/[0.07] disabled:opacity-30 disabled:hover:border-[#deff9a]/40 disabled:hover:bg-white/[0.04]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
