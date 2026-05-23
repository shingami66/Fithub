'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AddSetButtonProps {
  onClick: () => void;
}

export function AddSetButton({ onClick }: AddSetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 w-full mt-2 h-10 rounded-xl',
        'bg-white/[0.02] text-neutral-400 font-semibold text-xs tracking-wide uppercase',
        'transition-all duration-300 hover:bg-white/[0.05] hover:text-[#7dd3fc] active:scale-[0.98]',
      )}
    >
      <Plus className="h-4 w-4" />
      <span>Add Set</span>
    </button>
  );
}
