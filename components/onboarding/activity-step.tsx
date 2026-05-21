'use client';

import { useState } from 'react';
import { Armchair, Footprints, Bike, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ActivityStepProps {
  selectedLevel: string | null;
  onNext: (level: string) => void;
  onBack: () => void;
}

const ACTIVITIES = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    icon: Armchair,
  },
  {
    id: 'lightly_active',
    label: 'Lightly Active',
    description: '1-3 days/week',
    icon: Footprints,
  },
  {
    id: 'moderately_active',
    label: 'Moderately Active',
    description: '3-5 days/week',
    icon: Bike,
  },
  {
    id: 'very_active',
    label: 'Very Active',
    description: '6-7 days/week',
    icon: Zap,
  },
];

export function ActivityStep({ selectedLevel, onNext, onBack }: ActivityStepProps) {
  const [level, setLevel] = useState<string | null>(selectedLevel);

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          How active are you?
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Be honest—this affects your daily calorie targets.
        </p>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map(({ id, label, description, icon: Icon }) => {
          const isSelected = level === id;
          return (
            <button
              key={id}
              onClick={() => setLevel(id)}
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

      <div className="sticky bottom-0 mt-8 flex gap-3 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={onBack}
          className="rounded-xl border border-white/[0.06] bg-transparent px-6 py-4 text-sm font-medium text-neutral-400 transition-all hover:bg-white/[0.03] hover:text-white"
        >
          Back
        </button>
        <button
          onClick={() => level && onNext(level)}
          disabled={!level}
          className="flex-1 rounded-xl border border-[#deff9a]/40 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-[#deff9a]/70 hover:bg-white/[0.07] disabled:opacity-30 disabled:hover:border-[#deff9a]/40 disabled:hover:bg-white/[0.04]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
