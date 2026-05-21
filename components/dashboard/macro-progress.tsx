'use client';
import { motion } from 'framer-motion';

export interface Macro {
  label: string;
  consumed: number;
  target: number;
  color: string;
}

export function MacroProgress({ macros }: { macros: Macro[] }) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {macros.map((macro, idx) => {
        const percentage = Math.min((macro.consumed / macro.target) * 100, 100);
        return (
          <div key={macro.label} className="space-y-2.5">
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <span className="text-white/80">{macro.label}</span>
              <span>
                {macro.consumed}g <span className="text-neutral-600">/ {macro.target}g</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.03] border border-white/[0.02]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.2, delay: 0.3 + idx * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: macro.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
