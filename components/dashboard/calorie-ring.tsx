'use client';
import { motion } from 'framer-motion';

export function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(consumed / target, 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="relative flex items-center justify-center py-6">
      <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="14"
          fill="none"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#7dd3fc"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
          className="drop-shadow-[0_0_12px_rgba(125,211,252,0.3)]"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{consumed}</span>
        <span className="text-xs uppercase tracking-[0.1em] text-neutral-500 font-medium mt-1">
          of {target}
        </span>
      </div>
    </div>
  );
}
