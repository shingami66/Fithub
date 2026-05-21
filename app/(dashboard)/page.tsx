import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { RecoveryScoreCard } from '@/components/dashboard/recovery-score-card';
import { WeeklyPerformance } from '@/components/dashboard/weekly-performance';
import { InsightCard } from '@/components/dashboard/insight-card';

// Dynamically import Recharts to keep initial JS bundle small
const VolumeChart = dynamic(
  () => import('@/components/dashboard/volume-chart').then((mod) => mod.VolumeChart),
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full animate-pulse bg-white/[0.02] rounded-xl" />,
  },
);

const CaloriesTrendChart = dynamic(
  () => import('@/components/dashboard/calories-trend-chart').then((mod) => mod.CaloriesTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full animate-pulse bg-white/[0.02] rounded-xl" />,
  },
);

const MuscleFrequencyChart = dynamic(
  () =>
    import('@/components/dashboard/muscle-frequency-chart').then((mod) => mod.MuscleFrequencyChart),
  {
    ssr: false,
    loading: () => <div className="h-[250px] w-full animate-pulse bg-white/[0.02] rounded-xl" />,
  },
);

export default function DashboardPage() {
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
          <RecoveryScoreCard score={82} />
          <WeeklyPerformance />
        </div>

        {/* AI Insights Engine (Mocked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightCard
            type="positive"
            title="Volume Progression"
            description="Your total volume is up 12% this week. Great progressive overload."
          />
          <InsightCard
            type="warning"
            title="Missed Muscle Group"
            description="You haven't trained your Core in 8 days. Consider adding it tomorrow."
          />
          <InsightCard
            type="action"
            title="Nutrition Target"
            description="You are consistently 200 kcal under your bulk target. Time to eat more."
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Volume Chart */}
          <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Training Volume</h3>
              <p className="text-xs text-neutral-500 mt-1">Total weight moved per day</p>
            </div>
            <Suspense fallback={null}>
              <VolumeChart />
            </Suspense>
          </div>

          {/* Calories Trend Chart */}
          <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Caloric Intake</h3>
              <p className="text-xs text-neutral-500 mt-1">Daily consumed vs goal</p>
            </div>
            <Suspense fallback={null}>
              <CaloriesTrendChart />
            </Suspense>
          </div>

          {/* Muscle Frequency Radar */}
          <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-3xl p-6 lg:col-span-2 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full max-w-sm">
              <h3 className="text-sm font-semibold text-white">Muscle Frequency</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Target distribution over the last 30 days. Balance your posterior and anterior
                chains.
              </p>

              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Most Targeted</span>
                  <span className="text-[#deff9a] font-medium">Chest (28%)</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Least Targeted</span>
                  <span className="text-[#ff9a9a] font-medium">Core (5%)</span>
                </li>
              </ul>
            </div>

            <div className="flex-1 w-full">
              <Suspense fallback={null}>
                <MuscleFrequencyChart />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
