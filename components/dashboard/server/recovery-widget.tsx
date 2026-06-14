import { TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { AnalyticsService } from '@/lib/services/analytics.service';

export async function RecoveryWidget({ userId }: { userId: string }) {
  const recoveryResult = await safeMongoOperation(
    async () => {
      const [recoveryScore, weeklyPerformance] = await Promise.all([
        AnalyticsService.calculateRecoveryScore(userId),
        AnalyticsService.getWeeklyPerformance(userId),
      ]);
      return { recoveryScore, weeklyPerformance };
    },
    { operationName: 'dashboard.getRecoveryWidgetData', meta: { userId } },
  );

  return (
    <MetricCard
      title="Readiness Score"
      value={recoveryResult.ok ? (recoveryResult.data.recoveryScore ?? 'N/A') : undefined}
      subtitle={
        recoveryResult.ok && recoveryResult.data.recoveryScore !== null ? '/ 100' : undefined
      }
      icon={<TrendingUp className="h-4 w-4" />}
      className="min-h-[300px] min-w-0 sm:col-span-2 lg:col-span-4"
      delay={0.5}
    >
      {recoveryResult.ok ? (
        <div className="flex h-full flex-col items-center justify-center pb-8">
          <div className="relative flex w-full items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#7dd3fc]/5 blur-2xl" />
            <p className="relative px-4 text-center text-sm font-medium leading-relaxed text-neutral-400">
              {recoveryResult.data.recoveryScore === null
                ? 'Complete workouts to build recovery history.'
                : `${recoveryResult.data.weeklyPerformance.streak} completed workout week streak from saved sessions.`}
            </p>
          </div>
        </div>
      ) : (
        <DatabaseUnavailableState className="min-h-[180px] border-dashed bg-transparent" />
      )}
    </MetricCard>
  );
}
