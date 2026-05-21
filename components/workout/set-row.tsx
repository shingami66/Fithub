'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SetRowProps {
  setNumber: number;
  weight: string;
  reps: string;
  isCompleted: boolean;
  onUpdate: (field: 'weight' | 'reps', value: string) => void;
  onComplete: () => void;
}

export function SetRow({
  setNumber,
  weight,
  reps,
  isCompleted,
  onUpdate,
  onComplete,
}: SetRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center p-1 rounded-xl transition-all duration-300',
        isCompleted ? 'bg-[#deff9a]/5' : 'bg-transparent',
      )}
    >
      {/* Set Number */}
      <div className="flex items-center justify-center">
        <span className="text-xs font-bold text-neutral-500">{setNumber}</span>
      </div>

      {/* Weight Input */}
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => onUpdate('weight', e.target.value)}
          disabled={isCompleted}
          className={cn(
            'w-full h-12 text-center text-lg font-semibold rounded-lg transition-all',
            'bg-white/[0.04] border border-transparent focus:border-[#deff9a]/30 focus:bg-white/[0.06] focus:outline-none',
            'placeholder:text-neutral-700',
            isCompleted ? 'text-neutral-400 bg-transparent' : 'text-white',
          )}
          placeholder="0"
        />
      </div>

      {/* Reps Input */}
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={reps}
          onChange={(e) => onUpdate('reps', e.target.value)}
          disabled={isCompleted}
          className={cn(
            'w-full h-12 text-center text-lg font-semibold rounded-lg transition-all',
            'bg-white/[0.04] border border-transparent focus:border-[#deff9a]/30 focus:bg-white/[0.06] focus:outline-none',
            'placeholder:text-neutral-700',
            isCompleted ? 'text-neutral-400 bg-transparent' : 'text-white',
          )}
          placeholder="0"
        />
      </div>

      {/* Complete Toggle Button */}
      <button
        onClick={onComplete}
        className={cn(
          'flex items-center justify-center h-12 w-full rounded-lg transition-all duration-300 active:scale-90',
          isCompleted
            ? 'bg-[#deff9a] text-neutral-950 shadow-[0_0_15px_rgba(222,255,154,0.3)]'
            : 'bg-white/[0.05] text-neutral-600 hover:bg-white/[0.1] hover:text-white',
        )}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        <Check strokeWidth={3} className="h-5 w-5" />
      </button>
    </div>
  );
}
