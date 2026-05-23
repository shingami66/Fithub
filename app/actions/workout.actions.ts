'use server';

import { auth } from '@/lib/auth/auth';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import {
  addExerciseSchema,
  addSetSchema,
  updateSetSchema,
  AddExerciseInput,
  AddSetInput,
  UpdateSetInput,
} from '@/lib/validations/workout';
import { ActionResult } from '@/lib/validations/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SessionRestoreData = {
  session: Record<string, unknown>;
  entries: Record<string, unknown>[];
  sets: Record<string, unknown>[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AddExerciseData = {
  entry: Record<string, unknown>;
  initialSet: Record<string, unknown>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AddSetData = Record<string, unknown>;

export async function createOrRestoreSession(
  name: string = 'New Workout',
): Promise<ActionResult<SessionRestoreData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const db = await getDatabase();

    // 1. Try to find an existing active session to restore
    const existingSession = await db.collection('workout_sessions').findOne({
      userId: session.user.id,
      status: 'active',
    });

    if (existingSession) {
      // Fetch all entries and sets for this session to restore the state
      const entries = await db
        .collection('exercise_entries')
        .find({ sessionId: existingSession._id.toString(), userId: session.user.id })
        .sort({ order: 1 })
        .toArray();

      const sets = await db
        .collection('exercise_sets')
        .find({ sessionId: existingSession._id.toString(), userId: session.user.id })
        .sort({ setNumber: 1 })
        .toArray();

      return {
        success: true,
        data: {
          session: { ...existingSession, id: existingSession._id.toString() },
          entries: entries.map((e) => ({ ...e, id: e._id.toString() })),
          sets: sets.map((s) => ({ ...s, id: s._id.toString() })),
        },
      };
    }

    // 2. If no active session, create a new one
    const newSession = {
      userId: session.user.id,
      name,
      status: 'active',
      startedAt: new Date(),
      lastInteractionAt: new Date(),
      durationMs: 0,
      totalVolumeKg: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection('workout_sessions').insertOne(newSession);

    return {
      success: true,
      data: {
        session: { ...newSession, id: res.insertedId.toString() },
        entries: [],
        sets: [],
      },
    };
  } catch (error) {
    console.error('Session Error:', error);
    return { success: false, error: 'Failed to create or restore session' };
  }
}

export async function addExerciseToWorkout(
  input: AddExerciseInput,
): Promise<ActionResult<AddExerciseData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = addExerciseSchema.parse(input);
    const db = await getDatabase();

    const newEntry = {
      userId: session.user.id,
      sessionId: validated.sessionId,
      exerciseId: validated.exerciseId,
      name: validated.name,
      targetMuscle: validated.targetMuscle,
      order: validated.order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection('exercise_entries').insertOne(newEntry);

    // Also create the first set automatically
    const newSet = {
      userId: session.user.id,
      entryId: res.insertedId.toString(),
      sessionId: validated.sessionId,
      setNumber: 1,
      reps: null,
      weightKg: null,
      completed: false,
      type: 'working',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const setRes = await db.collection('exercise_sets').insertOne(newSet);

    // Update last interaction
    await db
      .collection('workout_sessions')
      .updateOne(
        { _id: new ObjectId(validated.sessionId), userId: session.user.id },
        { $set: { lastInteractionAt: new Date(), updatedAt: new Date() } },
      );

    return {
      success: true,
      data: {
        entry: { ...newEntry, id: res.insertedId.toString() },
        initialSet: { ...newSet, id: setRes.insertedId.toString() },
      },
    };
  } catch (error) {
    console.error('Add Exercise Error:', error);
    return { success: false, error: 'Failed to add exercise' };
  }
}

export async function addSetToExercise(input: AddSetInput): Promise<ActionResult<AddSetData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = addSetSchema.parse(input);
    const db = await getDatabase();

    // Find previous set to copy weight/reps if needed (optional logic, but handled mostly client-side for UX)

    const newSet = {
      userId: session.user.id,
      entryId: validated.entryId,
      sessionId: validated.sessionId,
      setNumber: validated.setNumber,
      reps: null,
      weightKg: null,
      completed: false,
      type: 'working',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection('exercise_sets').insertOne(newSet);

    await db
      .collection('workout_sessions')
      .updateOne(
        { _id: new ObjectId(validated.sessionId), userId: session.user.id },
        { $set: { lastInteractionAt: new Date(), updatedAt: new Date() } },
      );

    return {
      success: true,
      data: { ...newSet, id: res.insertedId.toString() },
    };
  } catch (error) {
    console.error('Add Set Error:', error);
    return { success: false, error: 'Failed to add set' };
  }
}

export async function updateSet(input: UpdateSetInput): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = updateSetSchema.parse(input);
    const db = await getDatabase();

    const { setId, ...updateFields } = validated;

    await db.collection('exercise_sets').updateOne(
      { _id: new ObjectId(setId), userId: session.user.id },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
    );

    return { success: true, data: true };
  } catch (error) {
    console.error('Update Set Error:', error);
    return { success: false, error: 'Failed to update set' };
  }
}

export async function finishWorkoutSession(
  sessionId: string,
  durationMs: number,
  totalVolumeKg: number,
): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const db = await getDatabase();

    await db.collection('workout_sessions').updateOne(
      { _id: new ObjectId(sessionId), userId: session.user.id },
      {
        $set: {
          status: 'completed',
          endedAt: new Date(),
          durationMs,
          totalVolumeKg,
          updatedAt: new Date(),
        },
      },
    );

    return { success: true, data: true };
  } catch (error) {
    console.error('Finish Workout Error:', error);
    return { success: false, error: 'Failed to finish workout' };
  }
}
