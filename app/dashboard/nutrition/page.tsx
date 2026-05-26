import { redirect } from 'next/navigation';
import { getNutritionLogs } from '@/app/actions/nutrition.actions';
import { NutritionPageClient } from '@/components/nutrition/nutrition-page-client';
import { auth } from '@/lib/auth/auth';
import { getUserProfileSafe } from '@/lib/services/user-profile.service';

export const dynamic = 'force-dynamic';

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const selectedDate = new Date();
  const [logsResult, profileResult] = await Promise.all([
    getNutritionLogs(selectedDate),
    getUserProfileSafe(session.user.id, { timeoutMs: 1500 }),
  ]);

  if (profileResult.ok && !profileResult.data?.onboardingCompleted) {
    redirect('/dashboard/onboarding');
  }

  const profile = profileResult.ok ? profileResult.data : null;

  return (
    <NutritionPageClient
      initialDate={selectedDate}
      initialLogs={logsResult.success ? (logsResult.data ?? []) : []}
      targets={{
        calories: profile?.dailyCalories ?? 0,
        protein: profile?.macros.protein ?? 0,
        carbs: profile?.macros.carbs ?? 0,
        fat: profile?.macros.fat ?? 0,
      }}
      initialError={logsResult.success ? undefined : logsResult.error}
      profileUnavailable={!profileResult.ok}
    />
  );
}
