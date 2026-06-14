'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string; positive?: boolean };
  className?: string;
  children?: ReactNode;
  delay?: number;
  glow?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  children,
  delay = 0,
  glow = false,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'group relative flex min-w-0 flex-col overflow-hidden rounded-[28px] p-6 sm:p-8',
        'bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl',
        'shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]',
        'transition-all duration-700 ease-out hover:-translate-y-1',
        'hover:bg-white/[0.04] hover:border-white/[0.12]',
        className,
      )}
    >
      <div className="relative z-10 flex h-full min-w-0 flex-col gap-4">
        {/* Header */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <div className="text-neutral-400 group-hover:text-[#7dd3fc] transition-colors">
                {icon}
              </div>
            )}
            <span className="min-w-0 break-words text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {title}
            </span>
          </div>
          {trend && (
            <span
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap',
                trend.positive !== false
                  ? 'bg-[#7dd3fc]/10 text-[#7dd3fc]'
                  : 'bg-red-500/10 text-red-400',
              )}
            >
              {trend.positive !== false ? '+' : '-'}
              {Math.abs(trend.value)}% {trend.label}
            </span>
          )}
        </div>

        {/* Primary Metric */}
        {(value !== undefined || subtitle) && (
          <div className="mt-auto pt-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-2">
              {value !== undefined && (
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  {value}
                </span>
              )}
              {subtitle && <span className="text-sm font-medium text-neutral-500">{subtitle}</span>}
            </div>
          </div>
        )}

        {/* Optional Visuals (Sparkline, etc) */}
        {children && <div className="mt-2 flex-1 w-full">{children}</div>}
      </div>

      {/* Subtle hover glow (restrained) */}
      {glow && (
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #7dd3fc 0%, transparent 70%)' }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
