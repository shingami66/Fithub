'use client';

import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function RecoveryScoreCard({ score }: { score: number }) {
  let colorClass = 'text-[#7dd3fc]';
  let label = 'Optimal';

  if (score < 40) {
    colorClass = 'text-[#ff9a9a]';
    label = 'Fatigued';
  } else if (score < 70) {
    colorClass = 'text-[#ffe59a]';
    label = 'Moderate';
  }

  return (
    <div className="bg-[#111111] border border-white/[0.05] rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.04] transition-colors" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-neutral-500" />
          <h3 className="text-sm font-medium text-neutral-400">Recovery Score</h3>
        </div>
      </div>

      <div className="flex items-end gap-3 relative z-10">
        <span className={cn('text-5xl font-black tracking-tighter', colorClass)}>{score}</span>
        <div className="flex flex-col pb-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">
            Status
          </span>
          <span className={cn('text-xs font-semibold uppercase tracking-wider', colorClass)}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
