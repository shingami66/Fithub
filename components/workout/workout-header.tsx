'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import Link from 'next/link';

interface WorkoutHeaderProps {
  name: string;
  isSaving: boolean;
  onFinish: () => void;
  startTime?: Date;
}

export function WorkoutHeader({ name, isSaving, onFinish, startTime }: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const m = Math.floor(diff / 60)
        .toString()
        .padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.04] safe-top">
      <div className="max-w-[780px] mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1 -ml-1 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-white leading-tight">{name}</h1>
            <div className="flex items-center gap-1.5 text-xs text-[#7dd3fc] font-medium">
              <Clock className="w-3 h-3" />
              <span className="font-mono tracking-wider">{elapsed}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold animate-pulse">
              Saving
            </span>
          )}
          <button
            onClick={onFinish}
            className="flex items-center gap-1.5 bg-[#7dd3fc] text-black px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform"
          >
            <Check className="w-3.5 h-3.5" />
            FINISH
          </button>
        </div>
      </div>
    </div>
  );
}
