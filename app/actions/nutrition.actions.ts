'use server';

import { auth } from '@/lib/auth/auth';
import { getDatabase } from '@/lib/db/mongodb';

import { nutritionLogSchema, type NutritionLogInput } from '@/lib/validations/nutrition';
import { ActionResult } from '@/lib/validations/common';

export async function saveNutritionLog(input: NutritionLogInput): Promise<ActionResult<unknown>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = nutritionLogSchema.parse(input);
    const db = await getDatabase();

    const logEntry = {
      ...validated,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection('nutrition_logs').insertOne(logEntry);

    return {
      success: true,
      data: { ...logEntry, id: res.insertedId.toString() },
    };
  } catch (error) {
    console.error('Save Nutrition Log Error:', error);
    return { success: false, error: 'Failed to save nutrition log' };
  }
}

export async function getNutritionLogs(date: Date): Promise<ActionResult<unknown[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const db = await getDatabase();

    // Simple date boundary for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await db
      .collection('nutrition_logs')
      .find({
        userId: session.user.id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .toArray();

    return {
      success: true,
      data: logs.map((log) => ({ ...log, id: log._id.toString() })),
    };
  } catch (error) {
    console.error('Get Nutrition Logs Error:', error);
    return { success: false, error: 'Failed to get nutrition logs' };
  }
}
