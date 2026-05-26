import { getDatabase } from './mongodb';
import { logger } from '@/lib/utils/logger';

export async function ensureIndexes() {
  const db = await getDatabase();

  // workout_sessions
  await db.collection('workout_sessions').createIndex({ userId: 1, status: 1 });
  await db.collection('workout_sessions').createIndex({ updatedAt: 1 });
  await db.collection('workout_sessions').createIndex({ userId: 1, startedAt: -1 });

  // exercise_entries
  await db.collection('exercise_entries').createIndex({ userId: 1, workoutSessionId: 1 });
  await db.collection('exercise_entries').createIndex({ userId: 1, sessionId: 1 });

  // exercise_sets
  await db.collection('exercise_sets').createIndex({ userId: 1, workoutSessionId: 1 });
  await db.collection('exercise_sets').createIndex({ userId: 1, sessionId: 1 });
  await db.collection('exercise_sets').createIndex({ userId: 1, exerciseEntryId: 1 });
  await db.collection('exercise_sets').createIndex({ userId: 1, entryId: 1 });

  // nutrition_logs
  await db.collection('nutrition_logs').createIndex({ userId: 1, date: 1, mealType: 1 });

  // food_entries
  await db.collection('food_entries').createIndex({ userId: 1, nutritionLogId: 1 });
  await db.collection('food_entries').createIndex({ userId: 1, createdAt: -1 });

  logger.info('MongoDB indexes verified.');
}
