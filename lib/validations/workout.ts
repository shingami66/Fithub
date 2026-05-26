import { z } from 'zod/v4';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdPattern, 'Invalid ObjectId format');
const optionalHttpUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith('http://') || value.startsWith('https://'))
  .optional();

export const updateSetSchema = z.object({
  setId: objectIdSchema,
  reps: z.number().min(0).max(500).nullable().optional(),
  weightKg: z.number().min(0).max(1000).nullable().optional(),
  rir: z.number().min(0).max(5).nullable().optional(),
  completed: z.boolean().optional(),
  restTimeSec: z.number().min(0).nullable().optional(),
  notes: z.string().max(500).optional(),
});

export const addExerciseSchema = z.object({
  sessionId: objectIdSchema,
  exerciseId: z.string().min(1),
  name: z.string().min(1),
  targetMuscle: z.string().min(1),
  bodyPart: z.string().optional(),
  equipment: z.string().optional(),
  gifUrl: optionalHttpUrlSchema,
  order: z.number().min(0),
});

export const workoutSessionIdSchema = z.object({
  sessionId: objectIdSchema,
});

export const deleteExerciseSchema = z.object({
  sessionId: objectIdSchema,
  entryId: objectIdSchema,
});

export const deleteSetSchema = z.object({
  setId: objectIdSchema,
});

export const addSetSchema = z.object({
  sessionId: objectIdSchema,
  entryId: objectIdSchema,
  setNumber: z.number().min(1),
});

export type UpdateSetInput = z.infer<typeof updateSetSchema>;
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;
export type AddSetInput = z.infer<typeof addSetSchema>;
export type WorkoutSessionIdInput = z.infer<typeof workoutSessionIdSchema>;
export type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;
export type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export const workoutSessionDBSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
  lastInteractionAt: z.date(),
  durationMs: z.number().min(0),
  totalVolumeKg: z.number().min(0),
  notes: z.string().optional(),
  status: z.enum(['idle', 'active', 'paused', 'completed', 'cancelled']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const exerciseEntryDBSchema = z.object({
  userId: z.string().min(1),
  workoutSessionId: z.string().min(1),
  exerciseId: z.string().min(1),
  name: z.string().min(1),
  targetMuscle: z.string().min(1),
  bodyPart: z.string().optional(),
  equipment: z.string().optional(),
  gifUrl: optionalHttpUrlSchema,
  order: z.number().min(0),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const exerciseSetDBSchema = z.object({
  userId: z.string().min(1),
  exerciseEntryId: z.string().min(1),
  workoutSessionId: z.string().min(1),
  setNumber: z.number().min(1),
  reps: z.number().nullable(),
  weightKg: z.number().nullable(),
  rir: z.number().nullable().optional(),
  restTimeSec: z.number().nullable().optional(),
  notes: z.string().optional(),
  completed: z.boolean(),
  type: z.enum(['warmup', 'working', 'dropset', 'failure']),
  createdAt: z.date(),
  updatedAt: z.date(),
});
