'use client';

/* eslint-disable @next/next/no-img-element */

import { memo, useState } from 'react';
import { Check, Dumbbell, GripVertical, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { SetRow } from './set-row';
import { ExerciseEntry, ExerciseSet } from '@/types/workout';
import { useWorkoutDispatch } from '@/lib/store/workout-context';
import { addSetToExercise, deleteExerciseEntry, updateSet } from '@/app/actions/workout.actions';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/lib/i18n/types';

interface ExerciseCardProps {
  entry: ExerciseEntry;
  setIds: string[];
  setsById: Record<string, ExerciseSet & { isPR?: boolean }>;
}

export const ExerciseCard = memo(
  function ExerciseCard({ entry, setIds, setsById }: ExerciseCardProps) {
    const dispatch = useWorkoutDispatch();
    const [isAddingSet, setIsAddingSet] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const { t } = useLanguage();

    const handleAddSet = async () => {
      setIsAddingSet(true);
      const lastSetId = setIds[setIds.length - 1];
      const lastSet = lastSetId ? setsById[lastSetId] : null;

      const result = await addSetToExercise({
        entryId: entry.id,
        sessionId: entry.workoutSessionId,
        setNumber: setIds.length + 1,
      });

      if (result.success && result.data) {
        const newSet: ExerciseSet = {
          ...result.data,
          weightKg: lastSet?.weightKg ?? result.data.weightKg,
          reps: lastSet?.reps ?? result.data.reps,
        };

        dispatch({ type: 'ADD_SET', payload: { entryId: entry.id, set: newSet } });

        if (lastSet?.weightKg || lastSet?.reps) {
          await updateSet({
            setId: newSet.id,
            weightKg: newSet.weightKg,
            reps: newSet.reps,
          });
        }
        toast.success('Set added');
      } else {
        toast.error(result.error ?? 'Failed to add set');
      }

      setIsAddingSet(false);
    };

    const handleDeleteExercise = async () => {
      const removedSets = setIds.map((setId) => setsById[setId]).filter(Boolean);

      dispatch({ type: 'REMOVE_EXERCISE', payload: { entryId: entry.id } });
      setIsConfirmingDelete(false);

      const result = await deleteExerciseEntry(entry.id);

      if (!result.success) {
        dispatch({ type: 'ADD_EXERCISE', payload: { entry, sets: removedSets } });
        toast.error(result.error ?? 'Failed to delete exercise');
      } else {
        toast.success('Exercise deleted');
      }
    };

    return (
      <div className="bg-[#040816] border border-white/[0.04] rounded-2xl overflow-hidden mb-4 relative group">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/[0.02]">
          <div className="flex items-center gap-3">
            {/* Reorder Handle */}
            <button className="text-neutral-600 hover:text-white cursor-grab active:cursor-grabbing p-1">
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.03] flex items-center justify-center shrink-0">
              {entry.gifUrl ? (
                <img
                  src={entry.gifUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Dumbbell className="h-5 w-5 text-neutral-500" />
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white capitalize leading-tight">
                {entry.name}
              </h3>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">
                {entry.targetMuscle}
                {entry.equipment ? ` / ${entry.equipment}` : ''}
              </span>
            </div>
          </div>

          {isConfirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDeleteExercise}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-red-200 transition-colors hover:bg-red-500/25"
                aria-label="Confirm delete exercise"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-neutral-300 transition-colors hover:bg-white/[0.1]"
                aria-label="Cancel delete exercise"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-200 transition-colors"
              aria-label="Delete exercise"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sets Header */}
        <div className="flex items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 bg-white/[0.01]">
          <span className="w-10 text-center">{t('Set')}</span>
          <span className="flex-1 px-4">{t('Previous')}</span>
          <span className="w-20 text-center">{t('kg')}</span>
          <span className="w-20 text-center">{t('reps')}</span>
          <span className="w-9 text-center">
            <Check className="w-3 h-3 mx-auto" />
          </span>
        </div>

        {/* Sets List */}
        <div className="flex flex-col px-2 pb-2">
          {setIds.map((setId, idx) => {
            const set = setsById[setId];
            if (!set) return null;
            return <SetRow key={setId} setId={setId} entryId={entry.id} index={idx} set={set} />;
          })}
        </div>

        {/* Add Set Button */}
        <button
          onClick={handleAddSet}
          disabled={isAddingSet}
          className="w-full py-2.5 text-xs font-bold text-[#7dd3fc] bg-[#7dd3fc]/[0.02] hover:bg-[#7dd3fc]/10 transition-colors border-t border-white/[0.02] active:bg-[#7dd3fc]/20"
        >
          {isAddingSet ? t('ADDING...' as TranslationKey) : t('+ ADD SET' as TranslationKey)}
        </button>
      </div>
    );
  },
  (prev, next) => {
    if (prev.entry !== next.entry) return false;
    if (prev.setIds !== next.setIds) return false;

    // Only re-render if one of THIS exercise's sets changed
    for (const id of next.setIds) {
      if (prev.setsById[id] !== next.setsById[id]) return false;
    }
    return true;
  },
);
