import { Exercise } from '@/types/exercise';

// Reducer State Types (Mapped for UI convenience)
export interface WorkoutSetState {
  id: string; // The database ObjectId
  weight: string;
  reps: string;
  isCompleted: boolean;
  isSyncing?: boolean; // For optimistic UI tracking
}

export interface WorkoutExerciseState {
  id: string; // Entry ID
  exerciseId: string;
  name: string;
  targetMuscle: string;
  sets: WorkoutSetState[];
}

export interface WorkoutState {
  sessionId: string | null;
  name: string;
  startTime: Date | null;
  exercises: WorkoutExerciseState[];
  isRestoring: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
}

// Reducer Actions
export type WorkoutAction =
  | {
      type: 'INIT_SESSION';
      payload: {
        sessionId: string;
        name: string;
        startTime: Date;
        exercises: WorkoutExerciseState[];
      };
    }
  | { type: 'ADD_EXERCISE'; payload: { entryId: string; exercise: Exercise; initialSetId: string } }
  | { type: 'ADD_SET'; payload: { entryId: string; setId: string; weight: string; reps: string } }
  | {
      type: 'UPDATE_SET';
      payload: { entryId: string; setId: string; field: 'weight' | 'reps'; value: string };
    }
  | { type: 'TOGGLE_SET_COMPLETE'; payload: { entryId: string; setId: string } }
  | { type: 'SET_SAVE_STATUS'; payload: 'saved' | 'saving' | 'error' };

export const initialWorkoutState: WorkoutState = {
  sessionId: null,
  name: '',
  startTime: null,
  exercises: [],
  isRestoring: true,
  saveStatus: 'saved',
};

export function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'INIT_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        name: action.payload.name,
        startTime: action.payload.startTime,
        exercises: action.payload.exercises,
        isRestoring: false,
      };

    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [
          ...state.exercises,
          {
            id: action.payload.entryId,
            exerciseId: action.payload.exercise.id,
            name: action.payload.exercise.name,
            targetMuscle: action.payload.exercise.targetMuscle,
            sets: [{ id: action.payload.initialSetId, weight: '', reps: '', isCompleted: false }],
          },
        ],
      };

    case 'ADD_SET':
      return {
        ...state,
        exercises: state.exercises.map((ex) => {
          if (ex.id === action.payload.entryId) {
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: action.payload.setId,
                  weight: action.payload.weight,
                  reps: action.payload.reps,
                  isCompleted: false,
                },
              ],
            };
          }
          return ex;
        }),
      };

    case 'UPDATE_SET':
      return {
        ...state,
        saveStatus: 'saving', // Optimistically mark as saving
        exercises: state.exercises.map((ex) => {
          if (ex.id === action.payload.entryId) {
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === action.payload.setId
                  ? { ...s, [action.payload.field]: action.payload.value }
                  : s,
              ),
            };
          }
          return ex;
        }),
      };

    case 'TOGGLE_SET_COMPLETE':
      return {
        ...state,
        saveStatus: 'saving',
        exercises: state.exercises.map((ex) => {
          if (ex.id === action.payload.entryId) {
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === action.payload.setId ? { ...s, isCompleted: !s.isCompleted } : s,
              ),
            };
          }
          return ex;
        }),
      };

    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };

    default:
      return state;
  }
}
