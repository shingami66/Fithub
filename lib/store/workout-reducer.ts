import { ExerciseEntry, ExerciseSet } from '@/types/workout';

export type WorkoutStatus = 'idle' | 'active' | 'paused' | 'completed';

// Normalized state shape
export interface WorkoutState {
  status: WorkoutStatus;
  startedAt?: number;
  pausedDurationMs: number;
  pausedAt?: number;
  entryIds: string[];
  entriesById: Record<string, ExerciseEntry>;
  setsByEntryId: Record<string, string[]>;
  setsById: Record<string, ExerciseSet & { isPR?: boolean }>;
}

export type UIExerciseEntry = ExerciseEntry & {
  sets: (ExerciseSet & { isPR?: boolean })[];
};

export type WorkoutAction =
  | { type: 'START_WORKOUT'; payload?: { startedAt?: number } }
  | { type: 'PAUSE_WORKOUT' }
  | { type: 'RESUME_WORKOUT' }
  | { type: 'FINISH_WORKOUT' }
  | {
      type: 'ADD_EXERCISE';
      payload: { entry: ExerciseEntry; sets: (ExerciseSet & { isPR?: boolean })[] };
    }
  | { type: 'ADD_SET'; payload: { entryId: string; set: ExerciseSet & { isPR?: boolean } } }
  | { type: 'UPDATE_SET'; payload: { setId: string; updates: Partial<ExerciseSet> } }
  | { type: 'COMPLETE_SET'; payload: { setId: string; startedAt?: number } }
  | { type: 'REMOVE_EXERCISE'; payload: { entryId: string } }
  | { type: 'REMOVE_SET'; payload: { entryId: string; setId: string } };

export const initialWorkoutState: WorkoutState = {
  status: 'idle',
  pausedDurationMs: 0,
  entryIds: [],
  entriesById: {},
  setsByEntryId: {},
  setsById: {},
};

export function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'START_WORKOUT':
      return {
        ...state,
        status: 'active',
        startedAt: state.startedAt || action.payload?.startedAt || Date.now(),
      };

    case 'PAUSE_WORKOUT':
      return {
        ...state,
        status: 'paused',
        pausedAt: state.pausedAt ?? Date.now(),
      };

    case 'RESUME_WORKOUT':
      return {
        ...state,
        status: 'active',
        pausedDurationMs:
          state.pausedAt && state.startedAt
            ? state.pausedDurationMs + Math.max(Date.now() - state.pausedAt, 0)
            : state.pausedDurationMs,
        pausedAt: undefined,
      };

    case 'FINISH_WORKOUT':
      return { ...state, status: 'completed' };

    case 'ADD_EXERCISE': {
      const { entry, sets } = action.payload;
      const setIds = sets.map((s) => s.id);
      const newSetsById = { ...state.setsById };
      sets.forEach((s) => {
        newSetsById[s.id] = s;
      });

      return {
        ...state,
        entryIds: [...state.entryIds, entry.id],
        entriesById: { ...state.entriesById, [entry.id]: entry },
        setsByEntryId: { ...state.setsByEntryId, [entry.id]: setIds },
        setsById: newSetsById,
      };
    }

    case 'ADD_SET': {
      const { entryId, set } = action.payload;
      return {
        ...state,
        setsByEntryId: {
          ...state.setsByEntryId,
          [entryId]: [...(state.setsByEntryId[entryId] || []), set.id],
        },
        setsById: {
          ...state.setsById,
          [set.id]: set,
        },
      };
    }

    case 'UPDATE_SET': {
      const { setId, updates } = action.payload;
      const existingSet = state.setsById[setId];
      if (!existingSet) return state;

      return {
        ...state,
        setsById: {
          ...state.setsById,
          [setId]: { ...existingSet, ...updates },
        },
      };
    }

    case 'COMPLETE_SET': {
      const { setId } = action.payload;
      const existingSet = state.setsById[setId];
      if (!existingSet) return state;

      const isCompleting = !existingSet.completed;

      const shouldStart = state.status === 'idle' && isCompleting;

      return {
        ...state,
        status: shouldStart ? 'active' : state.status,
        startedAt: shouldStart ? action.payload.startedAt || Date.now() : state.startedAt,
        setsById: {
          ...state.setsById,
          [setId]: { ...existingSet, completed: isCompleting },
        },
      };
    }

    case 'REMOVE_EXERCISE': {
      const { entryId } = action.payload;
      const setIds = state.setsByEntryId[entryId] || [];
      const entriesById = { ...state.entriesById };
      const setsByEntryId = { ...state.setsByEntryId };
      const setsById = { ...state.setsById };
      delete entriesById[entryId];
      delete setsByEntryId[entryId];
      setIds.forEach((setId) => {
        delete setsById[setId];
      });

      return {
        ...state,
        entryIds: state.entryIds.filter((id) => id !== entryId),
        entriesById,
        setsByEntryId,
        setsById,
      };
    }

    case 'REMOVE_SET': {
      const { entryId, setId } = action.payload;
      const setsById = { ...state.setsById };
      delete setsById[setId];

      return {
        ...state,
        setsByEntryId: {
          ...state.setsByEntryId,
          [entryId]: (state.setsByEntryId[entryId] || []).filter((id) => id !== setId),
        },
        setsById,
      };
    }

    default:
      return state;
  }
}

// Action Creators for initialization
export function initializeWorkoutState(
  entries: UIExerciseEntry[],
  options: { status?: WorkoutStatus; startedAt?: number; pausedDurationMs?: number } = {},
): WorkoutState {
  const state: WorkoutState = {
    status: options.status ?? initialWorkoutState.status,
    startedAt: options.startedAt,
    pausedDurationMs: options.pausedDurationMs ?? 0,
    entryIds: [],
    entriesById: {},
    setsByEntryId: {},
    setsById: {},
  };

  entries.forEach((entry) => {
    state.entryIds.push(entry.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sets, ...entryData } = entry;
    state.entriesById[entry.id] = entryData as ExerciseEntry;

    const setIds = sets.map((s) => s.id);
    state.setsByEntryId[entry.id] = setIds;

    sets.forEach((s) => {
      state.setsById[s.id] = s;
    });
  });

  return state;
}
