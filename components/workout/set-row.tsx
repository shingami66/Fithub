'use client';

import { useState, memo } from 'react';
import { Check, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SetRowProps {
  index: number;
  weight: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
  onUpdate: (weight: number, reps: number) => void;
  onToggleComplete: () => void;
}

export const SetRow = memo(function SetRow({
  index,
  weight,
  reps,
  completed,
  isPR,
  onUpdate,
  onToggleComplete,
}: SetRowProps) {
  const [localWeight, setLocalWeight] = useState(weight.toString());
  const [localReps, setLocalReps] = useState(reps.toString());

  const handleBlur = () => {
    const w = parseFloat(localWeight) || 0;
    const r = parseInt(localReps, 10) || 0;
    setLocalWeight(w.toString());
    setLocalReps(r.toString());
    onUpdate(w, r);
  };

  const incrementWeight = (amount: number) => {
    const current = parseFloat(localWeight) || 0;
    const updated = (current + amount).toString();
    setLocalWeight(updated);
    onUpdate(parseFloat(updated), parseInt(localReps, 10) || 0);
  };

  return (
    <div
      className={cn(
        'group flex items-center justify-between py-1.5 px-2 -mx-2 rounded-xl transition-colors',
        completed ? 'bg-[#7dd3fc]/[0.03]' : 'hover:bg-white/[0.02]',
      )}
    >
      {/* Set Number & PR Indicator */}
      <div className="flex items-center gap-2 w-10 shrink-0 justify-center">
        {isPR ? (
          <Trophy className="w-3.5 h-3.5 text-[#ffe59a]" />
        ) : (
          <span className="text-xs font-bold text-neutral-500">{index + 1}</span>
        )}
      </div>

      {/* Inputs Section */}
      <div className="flex flex-1 items-center gap-1.5 px-2">
        <div className="relative flex-1 max-w-[80px]">
          <input
            type="text"
            inputMode="decimal"
            value={localWeight}
            onChange={(e) => setLocalWeight(e.target.value)}
            onBlur={handleBlur}
            disabled={completed}
            className={cn(
              'w-full h-9 bg-white/[0.04] text-center text-sm font-bold rounded-lg outline-none transition-colors',
              completed
                ? 'text-neutral-400 bg-transparent'
                : 'text-white focus:bg-white/[0.08] focus:ring-1 focus:ring-[#7dd3fc]/30',
            )}
          />
        </div>

        <span className="text-xs text-neutral-600 font-medium px-1">kg</span>

        <div className="relative flex-1 max-w-[70px]">
          <input
            type="text"
            inputMode="numeric"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            onBlur={handleBlur}
            disabled={completed}
            className={cn(
              'w-full h-9 bg-white/[0.04] text-center text-sm font-bold rounded-lg outline-none transition-colors',
              completed
                ? 'text-neutral-400 bg-transparent'
                : 'text-white focus:bg-white/[0.08] focus:ring-1 focus:ring-[#7dd3fc]/30',
            )}
          />
        </div>
        <span className="text-xs text-neutral-600 font-medium px-1">reps</span>
      </div>

      {/* Quick Increments (Only show if not completed) */}
      {!completed && (
        <div className="hidden sm:flex items-center gap-1 mr-3">
          <button
            onClick={() => incrementWeight(2.5)}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 bg-white/[0.04] rounded-md hover:bg-white/10 active:scale-95 transition-all"
          >
            +2.5
          </button>
          <button
            onClick={() => incrementWeight(5)}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 bg-white/[0.04] rounded-md hover:bg-white/10 active:scale-95 transition-all"
          >
            +5
          </button>
        </div>
      )}

      {/* Check Button */}
      <button
        onClick={onToggleComplete}
        className={cn(
          'w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all active:scale-90',
          completed
            ? 'bg-[#7dd3fc] text-black'
            : 'bg-white/[0.05] text-neutral-500 hover:bg-white/[0.1] hover:text-white',
        )}
      >
        <Check className="w-4 h-4" strokeWidth={completed ? 3 : 2} />
      </button>
    </div>
  );
});
