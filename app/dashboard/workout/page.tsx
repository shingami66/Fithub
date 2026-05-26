import { redirect } from 'next/navigation';
import { createOrRestoreSession } from '@/app/actions/workout.actions';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { WorkoutPageClient } from '@/components/workout/workout-page-client';
import { requireAuth } from '@/lib/auth/auth';
import { isOnboardingCompleteSafe } from '@/lib/services/user-profile.service';
import type { ExerciseEntry, ExerciseSet } from '@/types/workout';
import type { UIExerciseEntry, WorkoutStatus } from '@/lib/store/workout-reducer';

export const dynamic = 'force-dynamic';

function groupEntriesWithSets(entries: ExerciseEntry[], sets: ExerciseSet[]): UIExerciseEntry[] {
  return entries.map((entry) => ({
    ...entry,
    sets: sets
      .filter((set) => set.exerciseEntryId === entry.id)
      .sort((a, b) => a.setNumber - b.setNumber),
  }));
}

export default async function WorkoutPage() {
  const sessionUser = await requireAuth();
  const onboardingResult = await isOnboardingCompleteSafe(sessionUser.user.id, {
    timeoutMs: 1500,
  });
  if (onboardingResult.ok && !onboardingResult.data) redirect('/dashboard/onboarding');

  const result = await createOrRestoreSession('New Workout');

  if (!result.success) {
    if (result.error === 'Unauthorized') redirect('/login');
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050505] px-6 text-center">
        <DatabaseUnavailableState
          title="Your data is temporarily unavailable. Please retry."
          message="Please retry. We could not restore your active workout session."
          className="w-full max-w-md"
        />
      </div>
    );
  }

  if (!result.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050505] px-6 text-center">
        <DatabaseUnavailableState
          title="Your data is temporarily unavailable. Please retry."
          message="Please retry. We could not restore your active workout session."
          className="w-full max-w-md"
        />
      </div>
    );
  }

  const { session, entries, sets } = result.data;
  const initialEntries = groupEntriesWithSets(entries, sets);
  const initialStatus: WorkoutStatus =
    session.status === 'active' || session.status === 'paused' ? session.status : 'idle';

  return (
    <WorkoutPageClient
      sessionId={session.id}
      sessionName={session.name}
      initialEntries={initialEntries}
      initialStatus={initialStatus}
      initialStartedAt={
        initialStatus === 'active' && session.startedAt ? session.startedAt.getTime() : undefined
      }
      initialPausedDurationMs={initialStatus === 'paused' ? session.durationMs : 0}
      profileUnavailable={!onboardingResult.ok}
    />
  );
}
