'use client';

import { User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OnboardingInput } from '@/lib/validations/onboarding';

interface BasicInfoStepProps {
  data: Partial<OnboardingInput>;
  onUpdate: <K extends keyof OnboardingInput>(
    field: K,
    value: OnboardingInput[K] | undefined,
  ) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BasicInfoStep({ data, onUpdate, onNext, onBack }: BasicInfoStepProps) {
  const isComplete = data.gender && data.age && data.heightCm && data.weightKg;

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          About you
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          We need your basic details to calculate your macros accurately.
        </p>
      </div>

      <div className="space-y-5">
        {/* Gender Selection */}
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map((g) => {
            const isSelected = data.gender === g;
            return (
              <button
                key={g}
                onClick={() => onUpdate('gender', g)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-300',
                  isSelected
                    ? 'border-[#7dd3fc]/30 bg-[#7dd3fc]/[0.04] shadow-[0_0_15px_rgba(125,211,252,0.05)]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]',
                )}
              >
                <User
                  className={cn('h-6 w-6', isSelected ? 'text-[#7dd3fc]' : 'text-neutral-500')}
                />
                <span
                  className={cn(
                    'text-sm font-medium capitalize',
                    isSelected ? 'text-white' : 'text-neutral-400',
                  )}
                >
                  {g}
                </span>
              </button>
            );
          })}
        </div>

        {/* Numeric Inputs */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Age</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={data.age || ''}
              onChange={(e) => onUpdate('age', parseInt(e.target.value) || undefined)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-lg text-white placeholder-neutral-600 transition-colors focus:border-[#7dd3fc]/30 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                Height (cm)
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="175"
                value={data.heightCm || ''}
                onChange={(e) => onUpdate('heightCm', parseInt(e.target.value) || undefined)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-lg text-white placeholder-neutral-600 transition-colors focus:border-[#7dd3fc]/30 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                Weight (kg)
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="70"
                value={data.weightKg || ''}
                onChange={(e) => onUpdate('weightKg', parseInt(e.target.value) || undefined)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-lg text-white placeholder-neutral-600 transition-colors focus:border-[#7dd3fc]/30 focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 flex gap-3 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={onBack}
          className="rounded-xl border border-white/[0.06] bg-transparent px-6 py-4 text-sm font-medium text-neutral-400 transition-all hover:bg-white/[0.03] hover:text-white"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className="flex-1 rounded-xl border border-[#7dd3fc]/40 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-[#7dd3fc]/70 hover:bg-white/[0.07] disabled:opacity-30 disabled:hover:border-[#7dd3fc]/40 disabled:hover:bg-white/[0.04]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
