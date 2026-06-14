import { Flame, Target } from 'lucide-react';
import { CalorieRing } from '@/components/dashboard/calorie-ring';
import { MacroProgress } from '@/components/dashboard/macro-progress';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { AnalyticsService } from '@/lib/services/analytics.service';
import type { UserProfile } from '@/lib/validations/onboarding';

export async function CalorieSummaryWidget({
  userId,
  profile,
}: {
  userId: string;
  profile: UserProfile;
}) {
  const nutritionResult = await safeMongoOperation(
    () => AnalyticsService.getTodayNutrition(userId),
    { operationName: 'dashboard.getTodayNutrition', meta: { userId } },
  );

  if (!nutritionResult.ok) {
    return (
      <MetricCard
        title="Daily Energy"
        icon={<Target className="h-4 w-4" />}
        className="min-h-[340px] min-w-0 sm:col-span-2 lg:col-span-9"
        glow
      >
        <DatabaseUnavailableState className="min-h-[230px] border-dashed bg-transparent" />
      </MetricCard>
    );
  }

  const nutritionSummary = nutritionResult.data;
  const calorieData = {
    consumed: Math.round(nutritionSummary.totals.calories),
    target: profile.dailyCalories ?? 0,
  };
  const macroData = [
    {
      label: 'Protein',
      consumed: Math.round(nutritionSummary.totals.protein),
      target: profile.macros.protein ?? 0,
      color: '#7dd3fc',
    },
    {
      label: 'Carbs',
      consumed: Math.round(nutritionSummary.totals.carbs),
      target: profile.macros.carbs ?? 0,
      color: '#ffffff',
    },
    {
      label: 'Fat',
      consumed: Math.round(nutritionSummary.totals.fat),
      target: profile.macros.fat ?? 0,
      color: '#888888',
    },
  ];

  return (
    <>
      <MetricCard
        title="Daily Energy"
        icon={<Target className="h-4 w-4" />}
        className="min-h-[340px] min-w-0 sm:col-span-1 lg:col-span-5"
        delay={0.1}
        glow
      >
        <div className="flex h-full flex-col items-center justify-center">
          <CalorieRing consumed={calorieData.consumed} target={calorieData.target} />
          <p className="mt-2 text-sm font-medium text-neutral-400">
            {calorieData.target > 0 ? (
              <>
                <span className="text-white">
                  {Math.max(calorieData.target - calorieData.consumed, 0)} kcal
                </span>{' '}
                remaining
              </>
            ) : (
              <span className="text-white">No calorie target configured</span>
            )}
          </p>
        </div>
      </MetricCard>

      <MetricCard
        title="Macronutrients"
        icon={<Flame className="h-4 w-4" />}
        className="min-h-[340px] min-w-0 sm:col-span-1 lg:col-span-4"
        delay={0.2}
      >
        <div className="flex h-full flex-col justify-center pt-4">
          <MacroProgress macros={macroData} />
        </div>
      </MetricCard>
    </>
  );
}
