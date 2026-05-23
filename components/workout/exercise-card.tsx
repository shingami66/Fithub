'use client';

import { memo } from 'react';
import { MoreHorizontal, GripVertical } from 'lucide-react';
import { SetRow } from './set-row';
import { ExerciseSet } from '@/types/workout';

import { UIExerciseEntry } from '@/app/dashboard/workout/page';

interface ExerciseCardProps {
  entry: UIExerciseEntry;
  onUpdateSet: (setId: string, updates: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
}

export const ExerciseCard = memo(function ExerciseCard({
  entry,
  onUpdateSet,
  onAddSet,
}: ExerciseCardProps) {
  return (
    <div className="bg-[#040816] border border-white/[0.04] rounded-2xl overflow-hidden mb-4 relative group">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/[0.02]">
        <div className="flex items-center gap-3">
          {/* Reorder Handle */}
          <button className="text-neutral-600 hover:text-white cursor-grab active:cursor-grabbing p-1">
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Thumbnail Placeholder */}
          <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              {entry.targetMuscle.slice(0, 3)}
            </span>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white capitalize leading-tight">{entry.name}</h3>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">
              {entry.targetMuscle}
            </span>
          </div>
        </div>

        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Sets Header */}
      <div className="flex items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 bg-white/[0.01]">
        <span className="w-10 text-center">Set</span>
        <span className="flex-1 px-4">Previous</span>
        <span className="w-20 text-center">kg</span>
        <span className="w-20 text-center">Reps</span>
        <span className="w-9 text-center">
          <Check className="w-3 h-3 mx-auto" />
        </span>
      </div>

      {/* Sets List */}
      <div className="flex flex-col px-2 pb-2">
        {entry.sets.map((set, idx) => (
          <SetRow
            key={set.id}
            index={idx}
            weight={set.weightKg || 0}
            reps={set.reps || 0}
            completed={set.completed}
            isPR={set.isPR}
            onUpdate={(w, r) => onUpdateSet(set.id, { weightKg: w, reps: r })}
            onToggleComplete={() => onUpdateSet(set.id, { completed: !set.completed })}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <button
        onClick={onAddSet}
        className="w-full py-2.5 text-xs font-bold text-[#7dd3fc] bg-[#7dd3fc]/[0.02] hover:bg-[#7dd3fc]/10 transition-colors border-t border-white/[0.02] active:bg-[#7dd3fc]/20"
      >
        + ADD SET
      </button>
    </div>
  );
});

// Inline Check Icon for the header row
function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
