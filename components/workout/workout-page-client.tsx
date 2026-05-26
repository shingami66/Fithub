'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { addExerciseToWorkout, finishWorkoutSession } from '@/app/actions/workout.actions';
import { AddExerciseButton } from '@/components/workout/add-exercise-button';
import { EmptyWorkoutState } from '@/components/workout/empty-workout-state';
import { ExerciseCard } from '@/components/workout/exercise-card';
import {
  ExerciseSearchSheet,
  type ExerciseSelectionSource,
} from '@/components/workout/exercise-search-sheet';
import { WorkoutHeader } from '@/components/workout/workout-header';
import { WorkoutProvider, useWorkoutDispatch, useWorkoutState } from '@/lib/store/workout-context';
import { normalizeOptionalUrl } from '@/lib/utils/url';
import type { UIExerciseEntry, WorkoutStatus } from '@/lib/store/workout-reducer';
import type { Exercise } from '@/types/exercise';

interface WorkoutPageClientProps {
  sessionId: string;
  sessionName: string;
  initialEntries: UIExerciseEntry[];
  initialStatus: WorkoutStatus;
  initialStartedAt?: number;
  initialPausedDurationMs?: number;
  profileUnavailable?: boolean;
}

export function WorkoutPageClient({
  sessionId,
  sessionName,
  initialEntries,
  initialStatus,
  initialStartedAt,
  initialPausedDurationMs,
  profileUnavailable = false,
}: WorkoutPageClientProps) {
  return (
    <WorkoutProvider
      initialEntries={initialEntries}
      initialStatus={initialStatus}
      initialStartedAt={initialStartedAt}
      initialPausedDurationMs={initialPausedDurationMs}
    >
      <WorkoutPageContent
        sessionId={sessionId}
        sessionName={sessionName}
        profileUnavailable={profileUnavailable}
      />
    </WorkoutProvider>
  );
}

function WorkoutPageContent({
  sessionId,
  sessionName,
  profileUnavailable,
}: {
  sessionId: string;
  sessionName: string;
  profileUnavailable: boolean;
}) {
  const state = useWorkoutState();
  const dispatch = useWorkoutDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevEntryCount = useRef(state.entryIds.length);

  useEffect(() => {
    if (state.entryIds.length > prevEntryCount.current) {
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
    prevEntryCount.current = state.entryIds.length;
  }, [state.entryIds.length]);

  const handleExerciseSelect = async (
    exercise: Exercise,
    source: ExerciseSelectionSource = 'fresh-search',
  ) => {
    setIsSaving(true);
    setError(null);

    const gifUrl = normalizeOptionalUrl(exercise.gifUrl);
    const result = await addExerciseToWorkout({
      sessionId,
      exerciseId: exercise.id,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      bodyPart: exercise.bodyPart,
      equipment: exercise.equipment,
      gifUrl,
      order: state.entryIds.length,
      source,
    });

    if (result.success && result.data) {
      dispatch({
        type: 'ADD_EXERCISE',
        payload: { entry: result.data.entry, sets: [result.data.initialSet] },
      });
      setIsSearchOpen(false);
      toast.success('Exercise added');
    } else {
      const message =
        result.errorCode === 'EXERCISE_VALIDATION_FAILED'
          ? "We couldn't add that exercise. Please try another result."
          : (result.error ?? 'Failed to add exercise');
      setError(message);
      toast.error(message);
    }

    setIsSaving(false);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    setError(null);

    const totalVolumeKg = Object.values(state.setsById).reduce((total, set) => {
      if (!set.completed || !set.weightKg || !set.reps) return total;
      return total + set.weightKg * set.reps;
    }, 0);
    const durationMs = state.startedAt
      ? Math.max(Date.now() - state.startedAt - state.pausedDurationMs, 0)
      : 0;
    const result = await finishWorkoutSession(sessionId, durationMs, totalVolumeKg);

    if (result.success) {
      dispatch({ type: 'FINISH_WORKOUT' });
      toast.success('Workout saved');
    } else {
      setError(result.error ?? 'Failed to finish workout');
      toast.error(result.error ?? 'Failed to finish workout');
    }

    setIsSaving(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#050505]">
      <WorkoutHeader name={sessionName} isSaving={isSaving} onFinish={handleFinish} />

      <main className="mx-auto flex w-full max-w-[780px] flex-1 flex-col gap-1 px-2 py-4 pb-32 sm:px-4">
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/15 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {profileUnavailable && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#7dd3fc]/15 bg-[#7dd3fc]/10 p-3 text-sm text-[#bfeeff]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your profile check is temporarily unavailable. Workout tracking can continue.
            </span>
          </div>
        )}

        {state.entryIds.length === 0 ? (
          <EmptyWorkoutState />
        ) : (
          state.entryIds.map((id) => (
            <ExerciseCard
              key={id}
              entry={state.entriesById[id]}
              setIds={state.setsByEntryId[id] || []}
              setsById={state.setsById}
            />
          ))
        )}

        <div className="mt-4">
          <AddExerciseButton onClick={() => setIsSearchOpen(true)} />
        </div>

        <div ref={bottomRef} className="h-4" />
      </main>

      <ExerciseSearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleExerciseSelect}
      />
    </div>
  );
}
