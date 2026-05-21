'use client';

import { useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutHeader } from '@/components/workout/workout-header';
import { ExerciseSearch } from '@/components/workout/exercise-search';
import { ExerciseCard } from '@/components/workout/exercise-card';
import { SetRow } from '@/components/workout/set-row';
import { AddSetButton } from '@/components/workout/add-set-button';
import { RestTimer } from '@/components/workout/rest-timer';
import { EmptyWorkoutState } from '@/components/workout/empty-workout-state';
import { Exercise } from '@/types/exercise';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import {
  workoutReducer,
  initialWorkoutState,
  WorkoutExerciseState,
} from '@/lib/reducers/workout-reducer';
import {
  createOrRestoreSession,
  addExerciseToWorkout,
  addSetToExercise,
  updateSet,
  finishWorkoutSession,
} from '@/app/actions/workout.actions';

export default function WorkoutPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);

  // Ref for debouncing input saves to prevent race conditions
  const saveTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // 1. Session Recovery / Init
  useEffect(() => {
    async function initSession() {
      const res = await createOrRestoreSession('New Workout');
      if (res.success) {
        const { session, entries, sets } = res.data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const builtExercises: WorkoutExerciseState[] = entries.map((entry: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const entrySets = sets
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((s: any) => s.entryId === entry.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((s: any) => ({
              id: s.id,
              weight: s.weightKg ? String(s.weightKg) : '',
              reps: s.reps ? String(s.reps) : '',
              isCompleted: s.completed,
            }));

          return {
            id: entry.id,
            exerciseId: entry.exerciseId,
            name: entry.name,
            targetMuscle: entry.targetMuscle,
            sets: entrySets,
          };
        });

        dispatch({
          type: 'INIT_SESSION',
          payload: {
            sessionId: session.id,
            name: session.name,
            startTime: new Date(session.startedAt),
            exercises: builtExercises,
          },
        });
      } else {
        alert('Failed to initialize session. Please try again.');
        router.push('/dashboard');
      }
    }

    initSession();
  }, [router]);

  // 2. Add Exercise (Optimistic UI fallback on error)
  const handleAddExercise = async (exercise: Exercise) => {
    if (!state.sessionId) return;

    // We must await here to get the generated DB IDs before rendering the new row,
    // otherwise subsequent updates to that row would lack IDs.
    // To keep it feeling instant, we show a loading spinner in the search bar (handled via state theoretically, but for now we block shortly).
    const res = await addExerciseToWorkout({
      sessionId: state.sessionId,
      exerciseId: exercise.id,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      order: state.exercises.length,
    });

    if (res.success) {
      dispatch({
        type: 'ADD_EXERCISE',
        payload: {
          entryId: res.data.entry.id,
          exercise,
          initialSetId: res.data.initialSet.id,
        },
      });
    }
  };

  // 3. Add Set
  const handleAddSet = async (entryId: string) => {
    if (!state.sessionId) return;

    const targetEx = state.exercises.find((e) => e.id === entryId);
    if (!targetEx) return;

    const res = await addSetToExercise({
      sessionId: state.sessionId,
      entryId,
      setNumber: targetEx.sets.length + 1,
    });

    if (res.success) {
      // Find previous set to optimistically copy values
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      dispatch({
        type: 'ADD_SET',
        payload: {
          entryId,
          setId: res.data.id,
          weight: lastSet ? lastSet.weight : '',
          reps: lastSet ? lastSet.reps : '',
        },
      });
    }
  };

  // 4. Update Set (Debounced Autosave + Optimistic UI)
  const handleUpdateSet = (
    entryId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string,
  ) => {
    // 1. Optimistically update UI instantly
    dispatch({ type: 'UPDATE_SET', payload: { entryId, setId, field, value } });

    // 2. Clear existing timer for this set field
    const timerKey = `${setId}-${field}`;
    if (saveTimers.current[timerKey]) {
      clearTimeout(saveTimers.current[timerKey]);
    }

    // 3. Set new debounced timer (600ms)
    saveTimers.current[timerKey] = setTimeout(async () => {
      const numericValue = value === '' ? null : Number(value);
      const res = await updateSet({
        setId,
        [field === 'weight' ? 'weightKg' : 'reps']: numericValue,
      });

      dispatch({ type: 'SET_SAVE_STATUS', payload: res.success ? 'saved' : 'error' });
    }, 600);
  };

  // 5. Toggle Completion (Instant + Autosave)
  const handleToggleSetComplete = async (
    entryId: string,
    setId: string,
    currentCompleted: boolean,
  ) => {
    // Optimistic
    dispatch({ type: 'TOGGLE_SET_COMPLETE', payload: { entryId, setId } });

    const res = await updateSet({ setId, completed: !currentCompleted });
    dispatch({ type: 'SET_SAVE_STATUS', payload: res.success ? 'saved' : 'error' });
  };

  const handleFinish = async () => {
    if (!state.sessionId) return;
    dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });

    // Calculate total volume
    let totalVolume = 0;
    state.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.isCompleted && set.weight && set.reps) {
          totalVolume += Number(set.weight) * Number(set.reps);
        }
      });
    });

    const diffMs = state.startTime ? Date.now() - state.startTime.getTime() : 0;

    const res = await finishWorkoutSession(state.sessionId, diffMs, totalVolume);
    if (res.success) {
      router.push('/dashboard');
    } else {
      alert('Failed to finish workout');
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
    }
  };

  if (state.isRestoring) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#deff9a]" />
          <p className="text-sm font-medium tracking-wide text-neutral-400">Restoring session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#050505]">
      <WorkoutHeader
        workoutName={state.name || 'Workout'}
        startTime={state.startTime || new Date()}
        onFinish={handleFinish}
        onCancel={() => router.push('/dashboard')}
      />

      {/* Save Status Indicator */}
      <div className="flex justify-center -mt-2 mb-2 relative z-50 pointer-events-none">
        <AnimatePresence mode="wait">
          {state.saveStatus === 'saving' && (
            <motion.span
              key="saving"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
            >
              Saving...
            </motion.span>
          )}
          {state.saveStatus === 'error' && (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-bold uppercase tracking-widest text-red-500"
            >
              Offline / Error
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pb-40">
        <div className="sticky top-[88px] z-40 py-4 bg-[#050505]/90 backdrop-blur-md">
          <ExerciseSearch onSelect={handleAddExercise} />
        </div>

        <div className="mt-4 flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {state.exercises.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyWorkoutState />
              </motion.div>
            ) : (
              state.exercises.map((ex, index) => (
                <motion.div
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <ExerciseCard name={ex.name} targetMuscle={ex.targetMuscle} order={index + 1}>
                    <AnimatePresence mode="popLayout">
                      {ex.sets.map((set, setIndex) => (
                        <motion.div
                          key={set.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <SetRow
                            setNumber={setIndex + 1}
                            weight={set.weight}
                            reps={set.reps}
                            isCompleted={set.isCompleted}
                            onUpdate={(field, val) => handleUpdateSet(ex.id, set.id, field, val)}
                            onComplete={() =>
                              handleToggleSetComplete(ex.id, set.id, set.isCompleted)
                            }
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <AddSetButton onClick={() => handleAddSet(ex.id)} />
                  </ExerciseCard>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <RestTimer />
    </div>
  );
}
