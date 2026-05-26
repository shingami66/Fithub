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
  calories: z.number().finite().min(0).max(10000),
  protein: z.number().finite().min(0).max(500),
  carbs: z.number().finite().min(0).max(1000),
  fat: z.number().finite().min(0).max(500),
});

export const nutrientsPer100gSchema = z.object({
  calories: z.number().finite().min(0),
  protein: z.number().finite().min(0),
  carbs: z.number().finite().min(0),
  fat: z.number().finite().min(0),
  fiber: z.number().finite().min(0).optional(),
  sodium: z.number().finite().min(0).optional(),
});

export const servingUnitSchema = z.enum(['g', 'cup', 'piece', 'tbsp', 'slice']);

export const foodEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  servingSize: z.number().finite().positive(),
  servingUnit: servingUnitSchema,
  servingDescription: z.string().min(1).max(120).optional(),
  quantity: z.number().finite().positive().optional(),
  grams: z.number().finite().positive().optional(),
  calories: z.number().finite().min(0),
  protein: z.number().finite().min(0),
  carbs: z.number().finite().min(0),
  fat: z.number().finite().min(0),
  fiber: z.number().finite().min(0).optional(),
  sodium: z.number().finite().min(0).optional(),
  nutrientsPer100g: nutrientsPer100gSchema.optional(),
});

export const foodEntryDBSchema = foodEntrySchema.extend({
  userId: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const nutritionLogSchema = z.object({
  date: z.date(),
  mealType: mealTypeEnum,
  entries: z.array(foodEntrySchema),
  totals: macroTotalsSchema,
  consumedAt: z.date(),
});

export const addFoodEntrySchema = z.object({
  date: z.date(),
  mealType: mealTypeEnum,
  entry: foodEntrySchema.omit({ id: true }),
});

export const deleteFoodEntrySchema = z.object({
  date: z.date(),
  mealType: mealTypeEnum,
  entryId: z.string().min(1),
});

export const updateFoodEntrySchema = z.object({
  entryId: z.string().min(1),
  quantity: z.number().finite().positive(),
  unit: servingUnitSchema,
});

export const nutritionLogDBSchema = nutritionLogSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NutritionLogInput = z.infer<typeof nutritionLogSchema>;
export type AddFoodEntryInput = z.infer<typeof addFoodEntrySchema>;
export type DeleteFoodEntryInput = z.infer<typeof deleteFoodEntrySchema>;
export type UpdateFoodEntryInput = z.infer<typeof updateFoodEntrySchema>;
