'use client';

import { Activity, Dumbbell, Timer } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { WorkoutActivityItem } from '@/lib/services/analytics.service';

export function WorkoutActivity({ workouts }: { workouts: WorkoutActivityItem[] }) {
  if (workouts.length === 0) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] px-6 text-center">
        <Dumbbell className="mb-3 h-7 w-7 text-neutral-600" />
        <p className="text-sm font-semibold text-white">No workout activity yet</p>
        <p className="mt-1 text-xs text-neutral-500">Saved workout sessions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className={cn(
            'group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 transition-all duration-300',
            'border-b border-white/[0.04] last:border-b-0',
            'hover:bg-white/[0.02]',
          )}
        >
          <div className="flex items-center gap-4 mb-3 sm:mb-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-400 group-hover:text-[#7dd3fc] group-hover:border-[#7dd3fc]/20 transition-all duration-300">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-white">{workout.name}</span>
              <span className="text-xs font-medium text-neutral-500">
                {workout.time} - {workout.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 text-xs font-semibold tracking-wide text-neutral-400">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-neutral-500" />
              <span>{workout.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#7dd3fc]/70" />
              <span className="text-white/80">{workout.volumeKg} kg</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
