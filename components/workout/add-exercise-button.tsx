'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AddExerciseButtonProps {
  onClick: () => void;
  className?: string;
}

export function AddExerciseButton({ onClick, className }: AddExerciseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full py-4 rounded-2xl border-2 border-dashed border-[#7dd3fc]/20 bg-[#7dd3fc]/[0.02] hover:bg-[#7dd3fc]/[0.05] hover:border-[#7dd3fc]/40 transition-all flex flex-col items-center justify-center gap-2 group active:scale-[0.98]',
        className,
      )}
    >
      <div className="w-8 h-8 rounded-full bg-[#7dd3fc]/10 flex items-center justify-center group-hover:bg-[#7dd3fc]/20 transition-colors">
        <Plus className="w-4 h-4 text-[#7dd3fc]" />
      </div>
      <span className="text-xs font-bold text-[#7dd3fc] tracking-wide uppercase">Add Exercise</span>
    </button>
  );
}
