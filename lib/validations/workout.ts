import { z } from 'zod/v4';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdPattern, 'Invalid ObjectId format');

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
  order: z.number().min(0),
});

export const addSetSchema = z.object({
  sessionId: objectIdSchema,
  entryId: objectIdSchema,
  setNumber: z.number().min(1),
});

export type UpdateSetInput = z.infer<typeof updateSetSchema>;
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;
export type AddSetInput = z.infer<typeof addSetSchema>;
