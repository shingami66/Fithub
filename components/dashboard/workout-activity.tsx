'use client';
import { Dumbbell, Timer, Flame } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const mockWorkouts = [
  { id: 1, name: 'Upper Body Power', duration: '45m', cals: 320, time: '2h ago' },
  { id: 2, name: 'Core & Mobility', duration: '20m', cals: 150, time: 'Yesterday' },
  { id: 3, name: 'Leg Day Hypertrophy', duration: '60m', cals: 450, time: '2 days ago' },
];

export function WorkoutActivity() {
  return (
    <div className="flex flex-col w-full">
      {mockWorkouts.map((w) => (
        <div
          key={w.id}
          className={cn(
            'group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 transition-all duration-300',
            'border-b border-white/[0.04] last:border-b-0',
            'hover:bg-white/[0.02]',
          )}
        >
          <div className="flex items-center gap-4 mb-3 sm:mb-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-400 group-hover:text-[#deff9a] group-hover:border-[#deff9a]/20 transition-all duration-300">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-white">{w.name}</span>
              <span className="text-xs font-medium text-neutral-500">{w.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 text-xs font-semibold tracking-wide text-neutral-400">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-neutral-500" />
              <span>{w.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#deff9a]/70" />
              <span className="text-white/80">{w.cals} kcal</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
