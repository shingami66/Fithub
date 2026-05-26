'use server';

import { auth } from '@/lib/auth/auth';
import { getDatabase } from '@/lib/db/mongodb';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { logger } from '@/lib/utils/logger';
import {
  addFoodEntrySchema,
  deleteFoodEntrySchema,
  nutritionLogSchema,
  updateFoodEntrySchema,
  type AddFoodEntryInput,
  type DeleteFoodEntryInput,
  type NutritionLogInput,
  type UpdateFoodEntryInput,
} from '@/lib/validations/nutrition';
import { ActionResult } from '@/lib/validations/common';
import { calculateMacros, getServingGrams } from '@/lib/utils/nutrition-calculations';
import { isKnownServingUnit } from '@/lib/utils/serving-units';
import type {
  FoodEntry,
  MacroTotals,
  MealType,
  NutritionLog,
  NutrientsPer100g,
  ServingUnit,
} from '@/types/nutrition';
import type { Document, ObjectId } from 'mongodb';

type NutritionDoc = Record<string, unknown> & { _id: ObjectId };

function logActionError(action: string, error: unknown, meta?: Record<string, unknown>) {
  if (error instanceof Error && error.name === 'ZodError') {
    logger.errorFingerprint('ACTION_VALIDATION_FAILED', action, meta);
    return;
  }

  logger.error(action, error, meta);
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function emptyTotals(): MacroTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function calculateTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce((totals, entry) => {
    totals.calories += entry.calories;
    totals.protein += entry.protein;
    totals.carbs += entry.carbs;
    totals.fat += entry.fat;
    return totals;
  }, emptyTotals());
}

function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
}

function asMealType(value: unknown): MealType {
  if (
    value === 'breakfast' ||
    value === 'lunch' ||
    value === 'dinner' ||
    value === 'snack' ||
    value === 'pre_workout' ||
    value === 'post_workout'
  ) {
    return value;
  }
  return 'snack';
}

function asNonNegativeFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function mapNutrientsPer100g(value: unknown): NutrientsPer100g | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const nutrients = value as Record<string, unknown>;
  const calories = asNonNegativeFiniteNumber(nutrients.calories);
  const protein = asNonNegativeFiniteNumber(nutrients.protein);
  const carbs = asNonNegativeFiniteNumber(nutrients.carbs);
  const fat = asNonNegativeFiniteNumber(nutrients.fat);

  if (calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return undefined;
  }

  return {
    calories,
    protein,
    carbs,
    fat,
    fiber: asNonNegativeFiniteNumber(nutrients.fiber),
    sodium: asNonNegativeFiniteNumber(nutrients.sodium),
  };
}

function hasValidMacros(entry: FoodEntry) {
  return (
    Number.isFinite(entry.calories) &&
    Number.isFinite(entry.protein) &&
    Number.isFinite(entry.carbs) &&
    Number.isFinite(entry.fat) &&
    entry.calories >= 0 &&
    entry.protein >= 0 &&
    entry.carbs >= 0 &&
    entry.fat >= 0 &&
    (entry.fiber === undefined || (Number.isFinite(entry.fiber) && entry.fiber >= 0)) &&
    (entry.sodium === undefined || (Number.isFinite(entry.sodium) && entry.sodium >= 0))
  );
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function formatServingDescription(quantity: number, unit: ServingUnit, grams: number) {
  if (unit === 'g') return `${Math.round(grams)} g`;
  return `${formatQuantity(quantity)} ${unit} (${Math.round(grams)} g)`;
}

function normalizeFoodEntryForSave(entry: FoodEntry): FoodEntry | null {
  const unit = entry.servingUnit;
  const quantity =
    entry.quantity ?? (unit === 'g' ? (entry.grams ?? entry.servingSize) : entry.servingSize);

  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const grams = getServingGrams(entry, quantity, unit);
  if (!grams || !Number.isFinite(grams) || grams <= 0) return null;

  const normalizedEntry: FoodEntry = {
    ...entry,
    servingSize: unit === 'g' ? grams : quantity,
    servingDescription: formatServingDescription(quantity, unit, grams),
    quantity,
    grams,
  };

  if (normalizedEntry.nutrientsPer100g) {
    const macros = calculateMacros(normalizedEntry, quantity, unit);
    normalizedEntry.calories = macros.calories;
    normalizedEntry.protein = macros.protein;
    normalizedEntry.carbs = macros.carbs;
    normalizedEntry.fat = macros.fat;
    normalizedEntry.fiber = macros.fiber;
    normalizedEntry.sodium = macros.sodium;
  } else if (unit !== 'g') {
    return null;
  }

  return hasValidMacros(normalizedEntry) ? normalizedEntry : null;
}

function mapFoodEntry(value: unknown): FoodEntry | null {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.name !== 'string' || !entry.name.trim()) return null;
  const servingUnit = String(entry.servingUnit ?? 'g');

  return {
    id: String(entry.id ?? crypto.randomUUID()),
    name: entry.name,
    servingSize: Number(entry.servingSize ?? 1),
    servingUnit: isKnownServingUnit(servingUnit) ? servingUnit : 'g',
    servingDescription:
      typeof entry.servingDescription === 'string' ? entry.servingDescription : undefined,
    quantity: typeof entry.quantity === 'number' ? entry.quantity : undefined,
    grams: typeof entry.grams === 'number' ? entry.grams : undefined,
    calories: Number(entry.calories ?? 0),
    protein: Number(entry.protein ?? 0),
    carbs: Number(entry.carbs ?? 0),
    fat: Number(entry.fat ?? 0),
    fiber: typeof entry.fiber === 'number' ? entry.fiber : undefined,
    sodium: typeof entry.sodium === 'number' ? entry.sodium : undefined,
    nutrientsPer100g: mapNutrientsPer100g(entry.nutrientsPer100g),
  };
}

export async function deleteFoodEntryFromLog(
  input: DeleteFoodEntryInput,
): Promise<ActionResult<NutritionLog>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = deleteFoodEntrySchema.parse(input);
    const db = await getDatabase();
    const date = startOfDay(validated.date);
    const now = new Date();

    const log = await db.collection<NutritionDoc>('nutrition_logs').findOne({
      userId: session.user.id,
      date,
      mealType: validated.mealType,
    });

    if (!log) {
      return { success: false, error: 'Nutrition log not found', errorCode: 'LOG_NOT_FOUND' };
    }

    const entries = Array.isArray(log.entries)
      ? log.entries.map(mapFoodEntry).filter((entry): entry is FoodEntry => Boolean(entry))
      : [];
    const nextEntries = entries.filter((entry) => entry.id !== validated.entryId);

    if (nextEntries.length === entries.length) {
      return { success: false, error: 'Food entry not found', errorCode: 'ENTRY_NOT_FOUND' };
    }

    const totals = calculateTotals(nextEntries);
    const result = await db.collection<NutritionDoc>('nutrition_logs').findOneAndUpdate(
      {
        userId: session.user.id,
        date,
        mealType: validated.mealType,
      },
      {
        $set: {
          entries: nextEntries,
          totals,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      return { success: false, error: 'Nutrition log not found', errorCode: 'LOG_NOT_FOUND' };
    }

    return { success: true, data: mapNutritionLog(result) };
  } catch (error) {
    logActionError('Delete Food Entry Error', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
    }
    return {
      success: false,
      error: 'Failed to delete food entry',
      errorCode: 'FOOD_DELETE_FAILED',
    };
  }
}

export async function deleteFoodEntry(foodEntryId: string): Promise<ActionResult<NutritionLog>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const db = await getDatabase();
    const now = new Date();
    const log = await db.collection<NutritionDoc>('nutrition_logs').findOne({
      userId: session.user.id,
      'entries.id': foodEntryId,
    });

    if (!log) {
      return { success: false, error: 'Food entry not found', errorCode: 'ENTRY_NOT_FOUND' };
    }

    const entries = Array.isArray(log.entries)
      ? log.entries.map(mapFoodEntry).filter((entry): entry is FoodEntry => Boolean(entry))
      : [];
    const nextEntries = entries.filter((entry) => entry.id !== foodEntryId);

    if (nextEntries.length === entries.length) {
      return { success: false, error: 'Food entry not found', errorCode: 'ENTRY_NOT_FOUND' };
    }

    const result = await db.collection<NutritionDoc>('nutrition_logs').findOneAndUpdate(
      { _id: log._id, userId: session.user.id },
      {
        $set: {
          entries: nextEntries,
          totals: calculateTotals(nextEntries),
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      return { success: false, error: 'Nutrition log not found' };
    }

    return { success: true, data: mapNutritionLog(result) };
  } catch (error) {
    logActionError('Delete Food Entry Error', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
    }
    return {
      success: false,
      error: 'Failed to delete food entry',
      errorCode: 'FOOD_DELETE_FAILED',
    };
  }
}

export async function updateFoodEntry(
  input: UpdateFoodEntryInput,
): Promise<ActionResult<NutritionLog>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = updateFoodEntrySchema.parse(input);
    const now = new Date();

    const safeResult = await safeMongoOperation(
      async (): Promise<ActionResult<NutritionLog>> => {
        const db = await getDatabase();
        const log = await db.collection<NutritionDoc>('nutrition_logs').findOne({
          userId: session.user.id,
          'entries.id': validated.entryId,
        });

        if (!log) {
          return { success: false, error: 'Food entry not found', errorCode: 'ENTRY_NOT_FOUND' };
        }

        const entries = Array.isArray(log.entries)
          ? log.entries.map(mapFoodEntry).filter((entry): entry is FoodEntry => Boolean(entry))
          : [];
        const target = entries.find((entry) => entry.id === validated.entryId);

        if (!target) {
          return { success: false, error: 'Food entry not found', errorCode: 'ENTRY_NOT_FOUND' };
        }

        if (!target.nutrientsPer100g) {
          return {
            success: false,
            error: 'This entry cannot be edited precisely. Delete and re-add it.',
            errorCode: 'VALIDATION_FAILED',
          };
        }

        const grams = getServingGrams(target, validated.quantity, validated.unit);
        if (!grams || !Number.isFinite(grams) || grams <= 0) {
          return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
        }

        const macros = calculateMacros(target, validated.quantity, validated.unit);
        const updatedEntry: FoodEntry = {
          ...target,
          servingSize: validated.unit === 'g' ? grams : validated.quantity,
          servingUnit: validated.unit,
          servingDescription: formatServingDescription(validated.quantity, validated.unit, grams),
          quantity: validated.quantity,
          grams,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          fiber: macros.fiber,
          sodium: macros.sodium,
        };

        if (!hasValidMacros(updatedEntry)) {
          return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
        }

        const nextEntries = entries.map((entry) =>
          entry.id === validated.entryId ? updatedEntry : entry,
        );

        const result = await db.collection<NutritionDoc>('nutrition_logs').findOneAndUpdate(
          { _id: log._id, userId: session.user.id },
          {
            $set: {
              entries: nextEntries,
              totals: calculateTotals(nextEntries),
              updatedAt: now,
            },
          },
          { returnDocument: 'after' },
        );

        if (!result) {
          return { success: false, error: 'Food entry not found', errorCode: 'ENTRY_NOT_FOUND' };
        }

        return { success: true, data: mapNutritionLog(result) };
      },
      { operationName: 'nutrition.updateFoodEntry', meta: { userId: session.user.id } },
    );

    if (!safeResult.ok) {
      return { success: false, error: safeResult.message, errorCode: 'DB_UNAVAILABLE' };
    }

    return safeResult.data;
  } catch (error) {
    logActionError('Update Food Entry Error', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
    }
    return {
      success: false,
      error: 'Failed to update food entry',
      errorCode: 'FOOD_UPDATE_FAILED',
    };
  }
}

function mapNutritionLog(doc: NutritionDoc): NutritionLog {
  const entries = Array.isArray(doc.entries)
    ? doc.entries.map(mapFoodEntry).filter((entry): entry is FoodEntry => Boolean(entry))
    : [];

  return {
    id: doc._id.toString(),
    userId: String(doc.userId),
    date: asDate(doc.date),
    mealType: asMealType(doc.mealType),
    entries,
    totals: calculateTotals(entries),
    consumedAt: asDate(doc.consumedAt ?? doc.createdAt),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

export async function addFoodEntryToLog(
  input: AddFoodEntryInput,
): Promise<ActionResult<NutritionLog>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = addFoodEntrySchema.parse(input);
    const db = await getDatabase();
    const now = new Date();
    const entry = normalizeFoodEntryForSave({
      ...validated.entry,
      id: crypto.randomUUID(),
    });

    if (!entry) {
      return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
    }

    const updateDocument: Document = {
      $setOnInsert: {
        userId: session.user.id,
        date: startOfDay(validated.date),
        mealType: validated.mealType,
        createdAt: now,
        consumedAt: now,
      },
      $push: { entries: entry },
      $inc: {
        'totals.calories': entry.calories,
        'totals.protein': entry.protein,
        'totals.carbs': entry.carbs,
        'totals.fat': entry.fat,
      },
      $set: { updatedAt: now },
    };

    await db.collection('nutrition_logs').updateOne(
      {
        userId: session.user.id,
        date: startOfDay(validated.date),
        mealType: validated.mealType,
      },
      updateDocument,
      { upsert: true },
    );

    const savedLog = await db.collection<NutritionDoc>('nutrition_logs').findOne({
      userId: session.user.id,
      date: startOfDay(validated.date),
      mealType: validated.mealType,
    });

    if (!savedLog) {
      return { success: false, error: 'Nutrition log not found', errorCode: 'LOG_NOT_FOUND' };
    }

    return { success: true, data: mapNutritionLog(savedLog) };
  } catch (error) {
    logActionError('Add Food Entry Error', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
    }
    return { success: false, error: 'Failed to save food entry', errorCode: 'FOOD_SAVE_FAILED' };
  }
}

export async function saveNutritionLog(
  input: NutritionLogInput,
): Promise<ActionResult<NutritionLog>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = nutritionLogSchema.parse(input);
    const db = await getDatabase();
    const now = new Date();
    const totals = calculateTotals(validated.entries);

    const result = await db.collection<NutritionDoc>('nutrition_logs').findOneAndUpdate(
      {
        userId: session.user.id,
        date: startOfDay(validated.date),
        mealType: validated.mealType,
      },
      {
        $set: {
          entries: validated.entries,
          totals,
          consumedAt: validated.consumedAt,
          updatedAt: now,
        },
        $setOnInsert: {
          userId: session.user.id,
          date: startOfDay(validated.date),
          mealType: validated.mealType,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    if (!result) {
      return { success: false, error: 'Nutrition log not found', errorCode: 'LOG_NOT_FOUND' };
    }

    return { success: true, data: mapNutritionLog(result) };
  } catch (error) {
    logActionError('Save Nutrition Log Error', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', errorCode: 'VALIDATION_FAILED' };
    }
    return { success: false, error: 'Failed to save nutrition log', errorCode: 'LOG_SAVE_FAILED' };
  }
}

export async function getNutritionLogs(date: Date): Promise<ActionResult<NutritionLog[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const safeResult = await safeMongoOperation(
      async () => {
        const db = await getDatabase();

        const logs = await db
          .collection<NutritionDoc>('nutrition_logs')
          .find({
            userId: session.user.id,
            date: {
              $gte: startOfDay(date),
              $lte: endOfDay(date),
            },
          })
          .sort({ mealType: 1, consumedAt: 1 })
          .toArray();

        return logs.map(mapNutritionLog);
      },
      { operationName: 'nutrition.getNutritionLogs', meta: { userId: session.user.id } },
    );

    if (!safeResult.ok) {
      return { success: false, error: safeResult.message, errorCode: safeResult.errorCode };
    }

    return { success: true, data: safeResult.data };
  } catch (error) {
    logActionError('Get Nutrition Logs Error', error);
    return { success: false, error: 'Failed to get nutrition logs', errorCode: 'LOG_FETCH_FAILED' };
  }
}
