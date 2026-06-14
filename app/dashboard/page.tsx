import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { FloatingActionButton } from '@/components/dashboard/floating-action-button';
import { CalorieSummaryWidget } from '@/components/dashboard/server/calorie-summary-widget';
import { DashboardWidgetSkeleton } from '@/components/dashboard/server/dashboard-widget-skeleton';
import { RecoveryWidget } from '@/components/dashboard/server/recovery-widget';
import { WeeklyPerformanceWidget } from '@/components/dashboard/server/weekly-performance-widget';
import { WorkoutSummaryWidget } from '@/components/dashboard/server/workout-summary-widget';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { getUserProfileSafe } from '@/lib/services/user-profile.service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const firstName = session.user?.name?.split(' ')[0] ?? 'Athlete';
  const userId = session.user?.id;

  if (!userId) {
    redirect('/login');
  }

  const profileResult = await getUserProfileSafe(userId, { timeoutMs: 1500 });

  if (profileResult.ok && !profileResult.data?.onboardingCompleted) {
    redirect('/dashboard/onboarding');
  }
  const profile = profileResult.ok ? profileResult.data : null;

  return (
    <div className="flex min-h-full min-w-0 flex-col overflow-x-hidden">
      <DashboardHeader firstName={firstName} />

      {!profileResult.ok || !profile ? (
        <DatabaseUnavailableState />
      ) : (
        <>
          {/* 12-Column Responsive Bento Grid */}
          <section
            className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-12"
            aria-label="Dashboard overview"
          >
            <Suspense
              fallback={
                <>
                  <DashboardWidgetSkeleton className="min-h-[340px] sm:col-span-1 lg:col-span-5" />
                  <DashboardWidgetSkeleton className="min-h-[340px] sm:col-span-1 lg:col-span-4" />
                </>
              }
            >
              <CalorieSummaryWidget userId={userId} profile={profile} />
            </Suspense>

            <Suspense
              fallback={
                <DashboardWidgetSkeleton className="min-h-[340px] sm:col-span-2 lg:col-span-3" />
              }
            >
              <WeeklyPerformanceWidget userId={userId} />
            </Suspense>

            <Suspense
              fallback={
                <DashboardWidgetSkeleton className="min-h-[300px] sm:col-span-2 lg:col-span-8" />
              }
            >
              <WorkoutSummaryWidget userId={userId} />
            </Suspense>

            <Suspense
              fallback={
                <DashboardWidgetSkeleton className="min-h-[300px] sm:col-span-2 lg:col-span-4" />
              }
            >
              <RecoveryWidget userId={userId} />
            </Suspense>
          </section>

          <FloatingActionButton />
        </>
      )}
    </div>
  );
}
