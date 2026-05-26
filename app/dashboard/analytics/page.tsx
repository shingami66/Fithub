import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';
import { RecoveryScoreCard } from '@/components/dashboard/recovery-score-card';
import { WeeklyPerformance } from '@/components/dashboard/weekly-performance';
import { InsightCard } from '@/components/dashboard/insight-card';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { getUserProfileSafe } from '@/lib/services/user-profile.service';

// Dynamically import Recharts to keep initial JS bundle small
const VolumeChart = nextDynamic(
  () => import('@/components/dashboard/volume-chart').then((mod) => mod.VolumeChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] min-h-[260px] w-full min-w-0 animate-pulse rounded-xl bg-white/[0.02]" />
    ),
  },
);

const CaloriesTrendChart = nextDynamic(
  () => import('@/components/dashboard/calories-trend-chart').then((mod) => mod.CaloriesTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] min-h-[260px] w-full min-w-0 animate-pulse rounded-xl bg-white/[0.02]" />
    ),
  },
);

const MuscleFrequencyChart = nextDynamic(
  () =>
    import('@/components/dashboard/muscle-frequency-chart').then((mod) => mod.MuscleFrequencyChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] min-h-[260px] w-full min-w-0 animate-pulse rounded-xl bg-white/[0.02]" />
    ),
  },
);

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  const [profileResult, analyticsResult] = await Promise.all([
    getUserProfileSafe(userId, { timeoutMs: 1500 }),
    safeMongoOperation(
      async () => {
        const [volumeData, caloriesData, muscleData, recoveryScore, weeklyPerformance] =
          await Promise.all([
            AnalyticsService.calculateWorkoutVolume(userId),
            AnalyticsService.calculateCaloriesTrend(userId),
            AnalyticsService.calculateMuscleFrequency(userId),
            AnalyticsService.calculateRecoveryScore(userId),
            AnalyticsService.getWeeklyPerformance(userId),
          ]);

        return { volumeData, caloriesData, muscleData, recoveryScore, weeklyPerformance };
      },
      { operationName: 'analytics.pageData', meta: { userId } },
    ),
  ]);

  if (profileResult.ok && !profileResult.data?.onboardingCompleted)
    redirect('/dashboard/onboarding');

  if (!profileResult.ok || !analyticsResult.ok) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#050505] pb-32">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 md:px-6">
          <div className="mb-2 flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
            <p className="text-sm text-neutral-400">Your performance and recovery insights.</p>
          </div>
          <DatabaseUnavailableState />
        </div>
      </div>
    );
  }

  const { volumeData, caloriesData, muscleData, recoveryScore, weeklyPerformance } =
    analyticsResult.data;

  const avgCalories = caloriesData.some((day) => day.calories > 0)
    ? Math.round(caloriesData.reduce((acc, curr) => acc + curr.calories, 0) / caloriesData.length)
    : 0;
  const totalVolume = volumeData.reduce((sum, day) => sum + day.volume, 0);
  const hasMuscleData = Object.keys(muscleData).length > 0;

  return (
    <div className="flex flex-col min-h-dvh bg-[#050505] pb-32">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-neutral-400">Your performance and recovery insights.</p>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecoveryScoreCard score={recoveryScore} />
          <WeeklyPerformance summary={weeklyPerformance} />
        </div>

        {/* AI Insights Engine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightCard
            type="positive"
            title="Volume Progression"
            description={
              totalVolume > 0
                ? `${totalVolume} kg completed set volume logged over the last 7 days.`
                : 'No completed set volume logged over the last 7 days.'
            }
          />
          <InsightCard
            type="warning"
            title="Consistency"
            description={`You have worked out ${weeklyPerformance.streak} weeks in a row.`}
          />
          <InsightCard
            type="action"
            title="Nutrition Target"
            description={
              avgCalories > 0
                ? `Your rolling average is ${avgCalories} kcal.`
                : 'No saved nutrition logs in the last 7 days.'
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Volume Chart */}
          <div className="min-w-0 bg-[#040816] border border-white/[0.04] rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Training Volume</h3>
              <p className="text-xs text-neutral-500 mt-1">Total weight moved per day</p>
            </div>
            <Suspense fallback={null}>
              <VolumeChart data={volumeData} />
            </Suspense>
          </div>

          {/* Calories Trend Chart */}
          <div className="min-w-0 bg-[#040816] border border-white/[0.04] rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Caloric Intake</h3>
              <p className="text-xs text-neutral-500 mt-1">Daily consumed vs goal</p>
            </div>
            <Suspense fallback={null}>
              <CaloriesTrendChart data={caloriesData} />
            </Suspense>
          </div>

          {/* Muscle Frequency Radar */}
          <div className="min-w-0 bg-[#040816] border border-white/[0.04] rounded-3xl p-6 lg:col-span-2 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full max-w-sm">
              <h3 className="text-sm font-semibold text-white">Muscle Frequency</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Target distribution over the last 30 days.
              </p>

              <ul className="space-y-3">
                {hasMuscleData ? (
                  Object.entries(muscleData)
                    .slice(0, 3)
                    .map(([muscle, count]) => (
                      <li key={muscle} className="flex justify-between items-center text-sm">
                        <span className="text-neutral-400 capitalize">{muscle}</span>
                        <span className="text-[#7dd3fc] font-medium">{count}</span>
                      </li>
                    ))
                ) : (
                  <li className="text-sm text-neutral-500">No saved exercise entries yet.</li>
                )}
              </ul>
            </div>

            <div className="min-w-0 flex-1 w-full">
              <Suspense fallback={null}>
                <MuscleFrequencyChart data={muscleData} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
