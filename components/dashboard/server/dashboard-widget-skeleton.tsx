import { cn } from '@/lib/utils/cn';

export function DashboardWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 sm:p-8',
        className,
      )}
    >
      <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.08]" />
      <div className="mt-8 flex h-40 items-center justify-center">
        <div className="h-28 w-28 animate-pulse rounded-full bg-white/[0.05]" />
      </div>
      <div className="mt-6 h-3 w-2/3 animate-pulse rounded-full bg-white/[0.06]" />
    </div>
  );
}
