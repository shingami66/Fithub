import { Exercise } from '@/types/exercise';
import { ExerciseEntry, ExerciseSet } from '@/types/workout';

/**
 * Generates a temporary unique ID for optimistic UI updates.
 */
function generateTempId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

/**
 * Creates a normalized ExerciseEntry and its initial pristine Set 1
 * from a selected database Exercise.
 */
export function createPristineExercise(
  exercise: Exercise,
  workoutSessionId: string,
  order: number,
  userId: string,
): { entry: ExerciseEntry; sets: (ExerciseSet & { isPR?: boolean })[] } {
  const entryId = generateTempId('entry');

  const entry: ExerciseEntry = {
    id: entryId,
    workoutSessionId,
    exerciseId: exercise.id,
    name: exercise.name,
    targetMuscle: exercise.targetMuscle,
    order,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const pristineSet: ExerciseSet & { isPR?: boolean } = {
    id: generateTempId('set'),
    exerciseEntryId: entryId,
    workoutSessionId,
    setNumber: 1,
    type: 'working',
    weightKg: 0,
    reps: 0,
    completed: false,
    isPR: false,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    entry,
    sets: [pristineSet],
  };
}
