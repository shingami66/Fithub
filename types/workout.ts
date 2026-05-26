export type WorkoutStatus = 'idle' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface WorkoutSession {
  id: string; // Will map to _id locally but stringified
  userId: string;
  name: string;
  startedAt?: Date;
  endedAt?: Date;
  lastInteractionAt: Date; // CRITICAL for session recovery/autosave
  durationMs: number;
  totalVolumeKg: number;
  notes?: string;
  status: WorkoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseEntry {
  id: string;
  userId: string;
  workoutSessionId: string;
  exerciseId: string;
  name: string;
  targetMuscle: string;
  bodyPart?: string;
  equipment?: string;
  gifUrl?: string;
  order: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SetType = 'warmup' | 'working' | 'dropset' | 'failure';

export interface ExerciseSet {
  id: string;
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}
