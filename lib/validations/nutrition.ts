import { z } from 'zod/v4';

export const mealTypeEnum = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'post_workout',
]);

export const macroTotalsSchema = z.object({
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(500),
});

export const foodEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1).max(50),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
});

export const foodEntryDBSchema = foodEntrySchema.extend({
  userId: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const nutritionLogSchema = z.object({
  userId: z.string().min(1), // Often injected via server auth, but good to define
  date: z.date(),
  mealType: mealTypeEnum,
  entries: z.array(foodEntrySchema),
  totals: macroTotalsSchema,
  consumedAt: z.date(),
});

export const nutritionLogDBSchema = nutritionLogSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NutritionLogInput = z.infer<typeof nutritionLogSchema>;
