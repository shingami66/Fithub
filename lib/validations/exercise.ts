import { z } from 'zod/v4';

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bodyPart: z.string(),
  targetMuscle: z.string(),
  equipment: z.string(),
  gifUrl: z.string().url().or(z.string().length(0)),
  instructions: z.array(z.string()),
});

export const exerciseArraySchema = z.array(exerciseSchema);

export type ValidatedExercise = z.infer<typeof exerciseSchema>;
