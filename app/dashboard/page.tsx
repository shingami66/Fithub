import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { Activity, Flame, Target, Trophy, TrendingUp } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { CalorieRing } from '@/components/dashboard/calorie-ring';
import { MacroProgress } from '@/components/dashboard/macro-progress';
import { WorkoutActivity } from '@/components/dashboard/workout-activity';
import { WeeklyStreak } from '@/components/dashboard/weekly-streak';
import { FloatingActionButton } from '@/components/dashboard/floating-action-button';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const firstName = session.user?.name?.split(' ')[0] ?? 'Athlete';

  // Believable mock data for SaaS realism
  const calorieData = { consumed: 1840, target: 2400 };
  const macroData = [
    { label: 'Protein', consumed: 140, target: 180, color: '#7dd3fc' },
    { label: 'Carbs', consumed: 120, target: 200, color: '#ffffff' },
    { label: 'Fat', consumed: 50, target: 70, color: '#888888' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <DashboardHeader firstName={firstName} />

      {/* 12-Column Responsive Bento Grid */}
      <section className="grid grid-cols-12 gap-4 md:gap-5" aria-label="Dashboard overview">
        {/* Hero Card: Calories */}
        <MetricCard
          title="Daily Energy"
          icon={<Target className="h-4 w-4" />}
          className="col-span-12 md:col-span-6 lg:col-span-5 min-h-[340px]"
          delay={0.1}
          glow
        >
          <div className="flex flex-col items-center justify-center h-full">
            <CalorieRing consumed={calorieData.consumed} target={calorieData.target} />
            <p className="mt-2 text-sm text-neutral-400 font-medium">
              <span className="text-white">{calorieData.target - calorieData.consumed} kcal</span>{' '}
              remaining
            </p>
          </div>
        </MetricCard>

        {/* Macros Breakdown */}
        <MetricCard
          title="Macronutrients"
          icon={<Flame className="h-4 w-4" />}
          className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[340px]"
          delay={0.2}
        >
          <div className="flex flex-col justify-center h-full pt-4">
            <MacroProgress macros={macroData} />
          </div>
        </MetricCard>

        {/* Weekly Streak */}
        <MetricCard
          title="Activity Streak"
          value="4 Days"
          subtitle="Fire!"
          icon={<Trophy className="h-4 w-4" />}
          trend={{ value: 12, label: 'vs last week', positive: true }}
          className="col-span-12 lg:col-span-3 min-h-[340px]"
          delay={0.3}
          glow
        >
          <WeeklyStreak />
        </MetricCard>

        {/* Workout Activity Timeline */}
        <MetricCard
          title="Recent Activity"
          icon={<Activity className="h-4 w-4" />}
          className="col-span-12 lg:col-span-8 min-h-[300px]"
          delay={0.4}
        >
          <div className="mt-2">
            <WorkoutActivity />
          </div>
        </MetricCard>

        {/* Recovery / Readiness Score */}
        <MetricCard
          title="Readiness Score"
          value="88"
          subtitle="/ 100"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 5, label: 'recovery', positive: true }}
          className="col-span-12 lg:col-span-4 min-h-[300px]"
          delay={0.5}
        >
          <div className="flex flex-col items-center justify-center h-full pb-8">
            <div className="relative flex items-center justify-center w-full">
              <div className="absolute inset-0 bg-[#7dd3fc]/5 rounded-full blur-2xl" />
              <p className="relative text-center text-sm font-medium text-neutral-400 leading-relaxed px-4">
                Your CNS is fully recovered. You are primed for a high-intensity session today.
              </p>
            </div>
          </div>
        </MetricCard>
      </section>

      <FloatingActionButton />
    </div>
  );
}
