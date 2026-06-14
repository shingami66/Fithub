import { Trophy } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { WeeklyStreak } from '@/components/dashboard/weekly-streak';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { AnalyticsService } from '@/lib/services/analytics.service';

export async function WeeklyPerformanceWidget({ userId }: { userId: string }) {
  const weeklyActivityResult = await safeMongoOperation(
    () => AnalyticsService.getWeeklyActivity(userId),
    { operationName: 'dashboard.getWeeklyActivity', meta: { userId } },
  );
  const activeDays = weeklyActivityResult.ok
    ? weeklyActivityResult.data.filter((day) => day.active).length
    : 0;

  return (
    <MetricCard
      title="Activity Streak"
      value={weeklyActivityResult.ok ? `${activeDays} Days` : undefined}
      subtitle={weeklyActivityResult.ok ? 'This week' : undefined}
      icon={<Trophy className="h-4 w-4" />}
      className="min-h-[340px] min-w-0 sm:col-span-2 lg:col-span-3"
      delay={0.3}
      glow
    >
      {weeklyActivityResult.ok ? (
        <WeeklyStreak data={weeklyActivityResult.data} />
      ) : (
        <DatabaseUnavailableState className="mt-2 min-h-[210px] border-dashed bg-transparent" />
      )}
    </MetricCard>
  );
}
