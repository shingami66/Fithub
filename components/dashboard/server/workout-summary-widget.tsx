import { Activity } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { WorkoutActivity } from '@/components/dashboard/workout-activity';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { AnalyticsService } from '@/lib/services/analytics.service';

export async function WorkoutSummaryWidget({ userId }: { userId: string }) {
  const recentWorkoutsResult = await safeMongoOperation(
    () => AnalyticsService.getRecentWorkoutActivity(userId),
    { operationName: 'dashboard.getRecentWorkoutActivity', meta: { userId } },
  );

  return (
    <MetricCard
      title="Recent Activity"
      icon={<Activity className="h-4 w-4" />}
      className="col-span-12 min-w-0 lg:col-span-8 min-h-[300px]"
      delay={0.4}
    >
      <div className="mt-2">
        {recentWorkoutsResult.ok ? (
          <WorkoutActivity workouts={recentWorkoutsResult.data} />
        ) : (
          <DatabaseUnavailableState className="min-h-[180px] border-dashed bg-transparent" />
        )}
      </div>
    </MetricCard>
  );
}
