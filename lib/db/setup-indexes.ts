import { getDatabase } from './mongodb';

export async function ensureIndexes() {
  const db = await getDatabase();

  // workout_sessions
  await db.collection('workout_sessions').createIndex({ userId: 1, status: 1 });
  await db.collection('workout_sessions').createIndex({ updatedAt: 1 });

  // exercise_entries
  await db.collection('exercise_entries').createIndex({ sessionId: 1 });

  // exercise_sets
  await db.collection('exercise_sets').createIndex({ sessionId: 1 });
  await db.collection('exercise_sets').createIndex({ entryId: 1 });

  console.log('✅ MongoDB Indexes verified for workout engine.');
}
