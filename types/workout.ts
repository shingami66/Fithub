export type WorkoutStatus = 'active' | 'completed' | 'cancelled';

export interface WorkoutSession {
  id: string; // Will map to _id locally but stringified
  userId: string;
  name: string;
  startedAt: Date;
  endedAt?: Date;
  lastInteractionAt: Date; // CRITICAL for session recovery/autosave
  durationMs: number;
  totalVolumeKg: number;
  notes?: string;
  status: WorkoutStatus;
}

export interface ExerciseEntry {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  name: string;
  targetMuscle: string;
  order: number;
  notes?: string;
}

export type SetType = 'warmup' | 'working' | 'dropset' | 'failure';

export interface ExerciseSet {
  id: string;
  exerciseEntryId: string;
  workoutSessionId: string; // Denormalized for fast analytics
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  rir?: number | null;
  restTimeSec?: number | null; // CRITICAL for rest timing
  notes?: string; // CRITICAL for injury tracking or PRs
  completed: boolean;
  type: SetType;
}
