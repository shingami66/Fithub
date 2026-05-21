'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface WorkoutHeaderProps {
  workoutName: string;
  startTime: Date;
  onFinish: () => void;
  onCancel: () => void;
}

export function WorkoutHeader({ workoutName, startTime, onFinish, onCancel }: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const diffMs = Date.now() - startTime.getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="sticky top-0 z-50 flex flex-col pt-4 pb-2 bg-neutral-950/80 backdrop-blur-2xl border-b border-white/[0.05]">
      <div className="flex items-center justify-between px-4 md:px-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#deff9a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#deff9a]"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {elapsed}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            {workoutName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/[0.05] text-neutral-400 hover:text-white transition-colors"
            aria-label="Cancel Workout"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={onFinish}
            className="flex items-center gap-2 h-10 px-4 rounded-full bg-[#deff9a] text-neutral-950 font-semibold text-sm hover:bg-white active:scale-95 transition-all shadow-[0_0_15px_rgba(222,255,154,0.3)]"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
