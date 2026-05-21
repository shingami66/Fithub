'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ExerciseCardProps {
  name: string;
  targetMuscle: string;
  order: number;
  children: ReactNode;
}

export function ExerciseCard({ name, targetMuscle, order, children }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      layout
      className={cn(
        'relative flex flex-col w-full rounded-[24px] overflow-hidden',
        'bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl shadow-lg',
        'transition-colors duration-300',
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 sm:p-5 w-full text-left active:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/[0.05] text-xs font-bold text-[#deff9a]">
            {order}
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white leading-none">{name}</h3>
            <span className="text-xs font-medium text-neutral-500 mt-1 capitalize">
              {targetMuscle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-500">
          <div className="p-2 hover:text-white transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-1"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="px-2 pb-4 sm:px-4 sm:pb-5">
              {/* Column Headers */}
              <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-3 mb-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                <span className="text-center">Set</span>
                <span className="text-center">kg</span>
                <span className="text-center">Reps</span>
                <span className="text-center">✔</span>
              </div>

              {/* The Sets */}
              <div className="flex flex-col gap-2">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
