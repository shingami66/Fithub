'use client';

import { TrendingUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface InsightCardProps {
  type: 'positive' | 'warning' | 'neutral' | 'action';
  title: string;
  description: string;
}

export function InsightCard({ type, title, description }: InsightCardProps) {
  const Icon = {
    positive: TrendingUp,
    warning: AlertTriangle,
    neutral: CheckCircle2,
    action: Zap,
  }[type];

  const colorStyles = {
    positive: 'text-[#deff9a] bg-[#deff9a]/10 border-[#deff9a]/20',
    warning: 'text-[#ff9a9a] bg-[#ff9a9a]/10 border-[#ff9a9a]/20',
    neutral: 'text-neutral-300 bg-white/[0.03] border-white/[0.05]',
    action: 'text-[#9aabff] bg-[#9aabff]/10 border-[#9aabff]/20',
  }[type];

  return (
    <div className={cn('p-4 rounded-2xl border backdrop-blur-sm flex gap-4', colorStyles)}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <h4 className="text-sm font-bold tracking-wide">{title}</h4>
        <p className="text-xs mt-1 opacity-80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
