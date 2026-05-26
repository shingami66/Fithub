'use client';

import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import {
  workoutReducer,
  WorkoutState,
  WorkoutAction,
  initializeWorkoutState,
  UIExerciseEntry,
  WorkoutStatus,
} from './workout-reducer';

export const WorkoutStateContext = createContext<WorkoutState | null>(null);
export const WorkoutDispatchContext = createContext<React.Dispatch<WorkoutAction> | null>(null);

export function WorkoutProvider({
  children,
  initialEntries,
  initialStatus = 'idle',
  initialStartedAt,
  initialPausedDurationMs = 0,
}: {
  children: ReactNode;
  initialEntries: UIExerciseEntry[];
  initialStatus?: WorkoutStatus;
  initialStartedAt?: number;
  initialPausedDurationMs?: number;
}) {
  const initialState = useMemo(
    () =>
      initializeWorkoutState(initialEntries, {
        status: initialStatus,
        startedAt: initialStartedAt,
        pausedDurationMs: initialPausedDurationMs,
      }),
    [initialEntries, initialPausedDurationMs, initialStartedAt, initialStatus],
  );
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  return (
    <WorkoutStateContext.Provider value={state}>
      <WorkoutDispatchContext.Provider value={dispatch}>{children}</WorkoutDispatchContext.Provider>
    </WorkoutStateContext.Provider>
  );
}

export function useWorkoutState() {
  const context = useContext(WorkoutStateContext);
  if (!context) {
    throw new Error('useWorkoutState must be used within a WorkoutProvider');
  }
  return context;
}

export function useWorkoutDispatch() {
  const context = useContext(WorkoutDispatchContext);
  if (!context) {
    throw new Error('useWorkoutDispatch must be used within a WorkoutProvider');
  }
  return context;
}
