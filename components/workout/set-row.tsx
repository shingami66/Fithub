'use client';

import { useState, memo, useEffect } from 'react';
import { Check, Trash2, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { useWorkoutDispatch, useWorkoutState } from '@/lib/store/workout-context';
import { ExerciseSet } from '@/types/workout';
import { deleteSet, startWorkoutSession, updateSet } from '@/app/actions/workout.actions';
import { useLanguage } from '@/hooks/use-language';

interface SetRowProps {
  setId: string;
  entryId: string;
  index: number;
  set: ExerciseSet & { isPR?: boolean };
}

export const SetRow = memo(
  function SetRow({ setId, entryId, index, set }: SetRowProps) {
    const workout = useWorkoutState();
    const dispatch = useWorkoutDispatch();
    const [localWeight, setLocalWeight] = useState((set.weightKg || 0).toString());
    const [localReps, setLocalReps] = useState((set.reps || 0).toString());
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const { t } = useLanguage();

    // Sync local state if global state changes externally (e.g. initial load)
    useEffect(() => {
      setLocalWeight((set.weightKg || 0).toString());
      setLocalReps((set.reps || 0).toString());
    }, [set.weightKg, set.reps]);

    const handleBlur = async () => {
      const w = parseFloat(localWeight) || 0;
      const r = parseInt(localReps, 10) || 0;
      setLocalWeight(w.toString());
      setLocalReps(r.toString());

      if (w !== set.weightKg || r !== set.reps) {
        dispatch({ type: 'UPDATE_SET', payload: { setId, updates: { weightKg: w, reps: r } } });
        const result = await updateSet({ setId, weightKg: w, reps: r });
        if (!result.success) {
          dispatch({
            type: 'UPDATE_SET',
            payload: { setId, updates: { weightKg: set.weightKg, reps: set.reps } },
          });
          toast.error(result.error ?? 'Failed to save set');
        }
      }
    };

    const incrementWeight = async (amount: number) => {
      const current = parseFloat(localWeight) || 0;
      const updated = (current + amount).toString();
      const reps = parseInt(localReps, 10) || 0;
      setLocalWeight(updated);

      dispatch({
        type: 'UPDATE_SET',
        payload: { setId, updates: { weightKg: parseFloat(updated), reps } },
      });

      const result = await updateSet({ setId, weightKg: parseFloat(updated), reps });
      if (!result.success) {
        dispatch({
          type: 'UPDATE_SET',
          payload: { setId, updates: { weightKg: set.weightKg, reps: set.reps } },
        });
        toast.error(result.error ?? 'Failed to save set');
      }
    };

    const handleToggleComplete = async () => {
      const completed = !set.completed;
      const weightKg = parseFloat(localWeight) || 0;
      const reps = parseInt(localReps, 10) || 0;
      let startedAt: number | undefined;

      if (completed && workout.status === 'idle') {
        const startResult = await startWorkoutSession({ sessionId: set.workoutSessionId });
        if (!startResult.success || !startResult.data) {
          toast.error(startResult.error ?? 'Failed to start workout');
          return;
        }
        startedAt = new Date(startResult.data.startedAt).getTime();
      }

      const result = await updateSet({ setId, completed, weightKg, reps });
      if (result.success) {
        dispatch({ type: 'UPDATE_SET', payload: { setId, updates: { weightKg, reps } } });
        dispatch({ type: 'COMPLETE_SET', payload: { setId, startedAt } });
      } else {
        toast.error(result.error ?? 'Failed to save set');
      }
    };

    const handleDelete = async () => {
      dispatch({ type: 'REMOVE_SET', payload: { entryId, setId } });
      setIsConfirmingDelete(false);

      const result = await deleteSet(setId);
      if (!result.success) {
        dispatch({ type: 'ADD_SET', payload: { entryId, set } });
        toast.error(result.error ?? 'Failed to delete set');
      } else {
        toast.success('Set deleted');
      }
    };

    const completed = set.completed;
    const isPR = set.isPR;

    return (
      <div
        className={cn(
          'group flex items-center justify-between py-1.5 px-2 -mx-2 rounded-xl transition-colors',
          completed ? 'bg-[#7dd3fc]/[0.03]' : 'hover:bg-white/[0.02]',
        )}
      >
        {/* Set Number & PR Indicator */}
        <div className="flex items-center gap-2 w-10 shrink-0 justify-center">
          {isPR ? (
            <Trophy className="w-3.5 h-3.5 text-[#ffe59a]" />
          ) : (
            <span className="text-xs font-bold text-neutral-500">{index + 1}</span>
          )}
        </div>

        {/* Inputs Section */}
        <div className="flex flex-1 items-center gap-1.5 px-2">
          <div className="relative flex-1 max-w-[80px]">
            <input
              type="text"
              inputMode="decimal"
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
              onBlur={handleBlur}
              disabled={completed}
              className={cn(
                'w-full h-9 bg-white/[0.04] text-center text-sm font-bold rounded-lg outline-none transition-colors',
                completed
                  ? 'text-neutral-400 bg-transparent'
                  : 'text-white focus:bg-white/[0.08] focus:ring-1 focus:ring-[#7dd3fc]/30',
              )}
            />
          </div>

          <span className="text-xs text-neutral-600 font-medium px-1">{t('kg')}</span>

          <div className="relative flex-1 max-w-[70px]">
            <input
              type="text"
              inputMode="numeric"
              value={localReps}
              onChange={(e) => setLocalReps(e.target.value)}
              onBlur={handleBlur}
              disabled={completed}
              className={cn(
                'w-full h-9 bg-white/[0.04] text-center text-sm font-bold rounded-lg outline-none transition-colors',
                completed
                  ? 'text-neutral-400 bg-transparent'
                  : 'text-white focus:bg-white/[0.08] focus:ring-1 focus:ring-[#7dd3fc]/30',
              )}
            />
          </div>
          <span className="text-xs text-neutral-600 font-medium px-1">{t('reps')}</span>
        </div>

        {/* Quick Increments (Only show if not completed) */}
        {!completed && (
          <div className="hidden sm:flex items-center gap-1 me-3">
            <button
              onClick={() => incrementWeight(2.5)}
              className="px-2 py-1 text-[10px] font-bold text-neutral-400 bg-white/[0.04] rounded-md hover:bg-white/10 active:scale-95 transition-all"
            >
              +2.5
            </button>
            <button
              onClick={() => incrementWeight(5)}
              className="px-2 py-1 text-[10px] font-bold text-neutral-400 bg-white/[0.04] rounded-md hover:bg-white/10 active:scale-95 transition-all"
            >
              +5
            </button>
          </div>
        )}

        {isConfirmingDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-200 transition-all active:scale-90"
              aria-label="Confirm delete set"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-neutral-400 transition-all active:scale-90"
              aria-label="Cancel delete set"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="me-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-neutral-600 transition-all hover:bg-red-500/10 hover:text-red-200 active:scale-90"
              aria-label="Delete set"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleToggleComplete}
              className={cn(
                'w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-all active:scale-90',
                completed
                  ? 'bg-[#7dd3fc] text-black'
                  : 'bg-white/[0.05] text-neutral-500 hover:bg-white/[0.1] hover:text-white',
              )}
            >
              <Check className="w-4 h-4" strokeWidth={completed ? 3 : 2} />
            </button>
          </>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.setId === nextProps.setId &&
      prevProps.entryId === nextProps.entryId &&
      prevProps.index === nextProps.index &&
      prevProps.set === nextProps.set
    );
  },
);
