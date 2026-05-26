'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils/cn';

interface ChartShellProps {
  children: ReactElement;
  className?: string;
  height?: number;
}

export function ChartShell({ children, className, height = 260 }: ChartShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn('w-full min-w-0 min-h-[260px]', className)}
      style={{ height, minHeight: height }}
    >
      {mounted ? (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-white/[0.02]" />
      )}
    </div>
  );
}
