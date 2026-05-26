import { z } from 'zod/v4';

const optionalHttpUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith('http://') || value.startsWith('https://'))
  .optional();

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bodyPart: z.string(),
  targetMuscle: z.string(),
  equipment: z.string(),
  gifUrl: optionalHttpUrlSchema,
  imageUrl: optionalHttpUrlSchema,
  thumbnailUrl: optionalHttpUrlSchema,
  instructions: z.array(z.string()),
});

export const exerciseArraySchema = z.array(exerciseSchema);

export type ValidatedExercise = z.infer<typeof exerciseSchema>;
