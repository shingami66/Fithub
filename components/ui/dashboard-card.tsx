'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface DashboardCardProps {
  children?: ReactNode;
  className?: string;
  glow?: boolean;
  delay?: number;
}

export function DashboardCard({
  children,
  className,
  glow = false,
  delay = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(
        'group relative overflow-hidden rounded-3xl p-6 sm:p-8',
        /* Premium Layered Glassmorphism */
        'bg-white/[0.02] border border-white/[0.06] backdrop-blur-2xl',
        'shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_24px_-4px_rgba(0,0,0,0.4)]',
        /* Hover transitions */
        'transition-all duration-700 ease-out',
        'hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-1',
        glow &&
          'hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_40px_rgba(222,255,154,0.05)]',
        className,
      )}
    >
      {/* Decorative Glow inside the card */}
      {glow && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-[50px] transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: 'radial-gradient(circle, rgba(222,255,154,0.15) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
