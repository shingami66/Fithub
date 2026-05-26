'use server';

import { auth } from '@/lib/auth/auth';
import { getDatabase } from '@/lib/db/mongodb';
import { safeMongoOperation } from '@/lib/db/safe-db';
import { logger } from '@/lib/utils/logger';
import { normalizeOptionalUrl } from '@/lib/utils/url';
import { ObjectId } from 'mongodb';
import type { ExerciseEntry, ExerciseSet, WorkoutSession } from '@/types/workout';
import {
  addExerciseSchema,
  addSetSchema,
  deleteExerciseSchema,
  deleteSetSchema,
  workoutSessionIdSchema,
  updateSetSchema,
  AddExerciseInput,
  AddSetInput,
  DeleteExerciseInput,
  DeleteSetInput,
  UpdateSetInput,
  WorkoutSessionIdInput,
} from '@/lib/validations/workout';
import { ActionResult } from '@/lib/validations/common';

export type SessionRestoreData = {
  session: WorkoutSession;
  entries: ExerciseEntry[];
  sets: ExerciseSet[];
};
export type AddExerciseData = {
  entry: ExerciseEntry;
  initialSet: ExerciseSet;
};
export type AddSetData = ExerciseSet;
export type StartWorkoutData = {
  startedAt: string;
};

type MongoDoc = Record<string, unknown> & { _id: ObjectId };
type AddExerciseDebugSource = 'fresh-search' | 'recent' | 'tab';
type AddExerciseActionInput = AddExerciseInput & { source?: AddExerciseDebugSource };

function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
}

function toWorkoutStatus(value: unknown): WorkoutSession['status'] {
  if (
    value === 'idle' ||
    value === 'active' ||
    value === 'paused' ||
    value === 'completed' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return 'idle';
}

function mapSession(doc: MongoDoc): WorkoutSession {
  return {
    id: doc._id.toString(),
    userId: String(doc.userId),
    name: String(doc.name ?? 'New Workout'),
    startedAt: doc.startedAt ? asDate(doc.startedAt) : undefined,
    endedAt: doc.endedAt ? asDate(doc.endedAt) : undefined,
    lastInteractionAt: asDate(doc.lastInteractionAt ?? doc.updatedAt),
    durationMs: Number(doc.durationMs ?? 0),
    totalVolumeKg: Number(doc.totalVolumeKg ?? 0),
    notes: typeof doc.notes === 'string' ? doc.notes : undefined,
    status: toWorkoutStatus(doc.status),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

function mapEntry(doc: MongoDoc): ExerciseEntry {
  return {
    id: doc._id.toString(),
    userId: String(doc.userId),
    workoutSessionId: String(doc.workoutSessionId ?? doc.sessionId),
    exerciseId: String(doc.exerciseId),
    name: String(doc.name),
    targetMuscle: String(doc.targetMuscle),
    bodyPart: typeof doc.bodyPart === 'string' ? doc.bodyPart : undefined,
    equipment: typeof doc.equipment === 'string' ? doc.equipment : undefined,
    gifUrl: typeof doc.gifUrl === 'string' ? doc.gifUrl : undefined,
    order: Number(doc.order ?? 0),
    notes: typeof doc.notes === 'string' ? doc.notes : undefined,
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

function mapSet(doc: MongoDoc): ExerciseSet {
  return {
    id: doc._id.toString(),
    userId: String(doc.userId),
    exerciseEntryId: String(doc.exerciseEntryId ?? doc.entryId),
    workoutSessionId: String(doc.workoutSessionId ?? doc.sessionId),
    setNumber: Number(doc.setNumber ?? 1),
    reps: typeof doc.reps === 'number' ? doc.reps : null,
    weightKg: typeof doc.weightKg === 'number' ? doc.weightKg : null,
    rir: typeof doc.rir === 'number' ? doc.rir : null,
    restTimeSec: typeof doc.restTimeSec === 'number' ? doc.restTimeSec : null,
    notes: typeof doc.notes === 'string' ? doc.notes : undefined,
    completed: Boolean(doc.completed),
    type:
      doc.type === 'warmup' || doc.type === 'dropset' || doc.type === 'failure'
        ? doc.type
        : 'working',
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

function sessionOwnershipQuery(sessionId: string, userId: string, openOnly = true) {
  return {
    _id: new ObjectId(sessionId),
    userId,
    ...(openOnly ? { status: { $in: ['idle', 'active', 'paused'] } } : {}),
  };
}

function logActionError(action: string, error: unknown, meta?: Record<string, unknown>) {
  if (error instanceof Error && error.name === 'ZodError') {
    logger.errorFingerprint('ACTION_VALIDATION_FAILED', action, meta);
    return;
  }

  logger.error(action, error, meta);
}

function logAddExerciseValidationDiagnostic(
  input: unknown,
  sessionUserIdExists: boolean,
  zodFlattenedError?: unknown,
) {
  if (process.env.NODE_ENV !== 'development') return;

  const payload =
    typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const imageValueState = (value: unknown) => ({
    value,
    isUndefined: value === undefined,
    isEmptyString: value === '',
  });

  logger.debug('addExerciseToWorkout validation diagnostic', {
    source: payload.source ?? 'unknown',
    payloadKeys: Object.keys(payload),
    payloadValues: payload,
    sessionIdExists: Boolean(payload.sessionId),
    sessionUserIdExists,
    imageFields: {
      gifUrl: imageValueState(payload.gifUrl),
      imageUrl: imageValueState(payload.imageUrl),
      thumbnailUrl: imageValueState(payload.thumbnailUrl),
    },
    zodFlattenedError,
  });
}

function sanitizeAddExerciseInput(input: AddExerciseActionInput): AddExerciseActionInput {
  return {
    ...input,
    gifUrl: normalizeOptionalUrl(input.gifUrl),
  };
}

export async function createOrRestoreSession(
  name: string = 'New Workout',
): Promise<ActionResult<SessionRestoreData>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const safeResult = await safeMongoOperation(
      async () => {
        const db = await getDatabase();

        // 1. Try to find an existing open session to restore.
        const existingSession = await db.collection<MongoDoc>('workout_sessions').findOne(
          {
            userId: session.user.id,
            status: { $in: ['idle', 'active', 'paused'] },
          },
          { sort: { lastInteractionAt: -1, updatedAt: -1 } },
        );

        if (existingSession) {
          const sessionId = existingSession._id.toString();
          const entries = await db
            .collection<MongoDoc>('exercise_entries')
            .find({
              userId: session.user.id,
              $or: [{ workoutSessionId: sessionId }, { sessionId }],
            })
            .sort({ order: 1 })
            .toArray();

          const sets = await db
            .collection<MongoDoc>('exercise_sets')
            .find({
              userId: session.user.id,
              $or: [{ workoutSessionId: sessionId }, { sessionId }],
            })
            .sort({ exerciseEntryId: 1, entryId: 1, setNumber: 1 })
            .toArray();

          return {
            session: mapSession(existingSession),
            entries: entries.map(mapEntry),
            sets: sets.map(mapSet),
          };
        }

        // 2. If no active session exists, create a new idle one.
        const newSession = {
          userId: session.user.id,
          name,
          status: 'idle',
          lastInteractionAt: new Date(),
          durationMs: 0,
          totalVolumeKg: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const res = await db.collection('workout_sessions').insertOne(newSession);

        return {
          session: mapSession({ ...newSession, _id: res.insertedId }),
          entries: [],
          sets: [],
        };
      },
      { operationName: 'workout.createOrRestoreSession', meta: { userId: session.user.id } },
    );

    if (!safeResult.ok) {
      return { success: false, error: safeResult.message, errorCode: safeResult.errorCode };
    }

    return { success: true, data: safeResult.data };
  } catch (error) {
    logActionError('Session Error', error);
    return {
      success: false,
      error: 'Failed to create or restore session',
      errorCode: 'SESSION_CREATE_FAILED',
    };
  }
}

export async function startWorkoutSession(
  input: WorkoutSessionIdInput,
): Promise<ActionResult<StartWorkoutData>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = workoutSessionIdSchema.parse(input);
    const db = await getDatabase();
    const startedAt = new Date();

    const result = await db.collection('workout_sessions').findOneAndUpdate(
      sessionOwnershipQuery(validated.sessionId, session.user.id),
      {
        $set: {
          status: 'active',
          startedAt,
          lastInteractionAt: startedAt,
          updatedAt: startedAt,
        },
      },
      { returnDocument: 'after' },
    );

    if (!result) {
      return { success: false, error: 'Workout session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    const restoredStartedAt = result.startedAt instanceof Date ? result.startedAt : startedAt;
    return { success: true, data: { startedAt: restoredStartedAt.toISOString() } };
  } catch (error) {
    logActionError('Start Workout Error', error);
    return { success: false, error: 'Failed to start workout', errorCode: 'START_FAILED' };
  }
}

export async function addExerciseToWorkout(
  input: AddExerciseActionInput,
): Promise<ActionResult<AddExerciseData>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const sanitizedInput = sanitizeAddExerciseInput(input);
    const validation = addExerciseSchema.safeParse(sanitizedInput);
    if (!validation.success) {
      logAddExerciseValidationDiagnostic(
        sanitizedInput,
        Boolean(session.user.id),
        validation.error.flatten(),
      );
      throw validation.error;
    }

    const validated = validation.data;
    const db = await getDatabase();
    const workoutSession = await db
      .collection('workout_sessions')
      .findOne(sessionOwnershipQuery(validated.sessionId, session.user.id));

    if (!workoutSession) {
      return { success: false, error: 'Workout session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    const newEntry = {
      userId: session.user.id,
      workoutSessionId: validated.sessionId,
      exerciseId: validated.exerciseId,
      name: validated.name,
      targetMuscle: validated.targetMuscle,
      bodyPart: validated.bodyPart,
      equipment: validated.equipment,
      gifUrl: validated.gifUrl,
      order: validated.order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection('exercise_entries').insertOne(newEntry);

    // Also create the first set automatically
    const newSet = {
      userId: session.user.id,
      exerciseEntryId: res.insertedId.toString(),
      workoutSessionId: validated.sessionId,
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
        entry: mapEntry({ ...newEntry, _id: res.insertedId }),
        initialSet: mapSet({ ...newSet, _id: setRes.insertedId }),
      },
    };
  } catch (error) {
    logActionError('Add Exercise Error', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validation failed',
        errorCode: 'EXERCISE_VALIDATION_FAILED',
      };
    }
    return { success: false, error: 'Failed to add exercise', errorCode: 'EXERCISE_ADD_FAILED' };
  }
}

export async function addSetToExercise(input: AddSetInput): Promise<ActionResult<AddSetData>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = addSetSchema.parse(input);
    const db = await getDatabase();

    const ownedEntry = await db.collection('exercise_entries').findOne({
      _id: new ObjectId(validated.entryId),
      userId: session.user.id,
      $or: [{ workoutSessionId: validated.sessionId }, { sessionId: validated.sessionId }],
    });

    if (!ownedEntry) {
      return { success: false, error: 'Exercise entry not found', errorCode: 'ENTRY_NOT_FOUND' };
    }

    const ownedSession = await db
      .collection('workout_sessions')
      .findOne(sessionOwnershipQuery(validated.sessionId, session.user.id));

    if (!ownedSession) {
      return { success: false, error: 'Workout session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    const newSet = {
      userId: session.user.id,
      exerciseEntryId: validated.entryId,
      workoutSessionId: validated.sessionId,
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
      data: mapSet({ ...newSet, _id: res.insertedId }),
    };
  } catch (error) {
    logActionError('Add Set Error', error);
    return { success: false, error: 'Failed to add set', errorCode: 'SET_ADD_FAILED' };
  }
}

export async function updateSet(input: UpdateSetInput): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = updateSetSchema.parse(input);
    const db = await getDatabase();

    const { setId, ...updateFields } = validated;
    const ownedSet = await db.collection<MongoDoc>('exercise_sets').findOne({
      _id: new ObjectId(setId),
      userId: session.user.id,
    });

    if (!ownedSet) {
      return { success: false, error: 'Set not found', errorCode: 'SET_NOT_FOUND' };
    }

    const result = await db.collection('exercise_sets').updateOne(
      { _id: new ObjectId(setId), userId: session.user.id },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { success: false, error: 'Set not found', errorCode: 'SET_NOT_FOUND' };
    }

    const workoutSessionId = String(ownedSet.workoutSessionId ?? ownedSet.sessionId ?? '');
    if (ObjectId.isValid(workoutSessionId)) {
      await db
        .collection('workout_sessions')
        .updateOne(
          { _id: new ObjectId(workoutSessionId), userId: session.user.id },
          { $set: { lastInteractionAt: new Date(), updatedAt: new Date() } },
        );
    }

    return { success: true, data: true };
  } catch (error) {
    logActionError('Update Set Error', error);
    return { success: false, error: 'Failed to update set', errorCode: 'SET_UPDATE_FAILED' };
  }
}

export async function deleteExerciseFromWorkout(
  input: DeleteExerciseInput,
): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = deleteExerciseSchema.parse(input);
    const db = await getDatabase();
    const sessionQuery = sessionOwnershipQuery(validated.sessionId, session.user.id);
    const ownedSession = await db.collection('workout_sessions').findOne(sessionQuery);

    if (!ownedSession) {
      return { success: false, error: 'Workout session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    const entryResult = await db.collection('exercise_entries').deleteOne({
      _id: new ObjectId(validated.entryId),
      userId: session.user.id,
      $or: [{ workoutSessionId: validated.sessionId }, { sessionId: validated.sessionId }],
    });

    if (entryResult.deletedCount === 0) {
      return { success: false, error: 'Exercise entry not found', errorCode: 'ENTRY_NOT_FOUND' };
    }

    await db.collection('exercise_sets').deleteMany({
      userId: session.user.id,
      exerciseEntryId: validated.entryId,
      $or: [{ workoutSessionId: validated.sessionId }, { sessionId: validated.sessionId }],
    });

    await db.collection('workout_sessions').updateOne(sessionQuery, {
      $set: { lastInteractionAt: new Date(), updatedAt: new Date() },
    });

    return { success: true, data: true };
  } catch (error) {
    logActionError('Delete Exercise Error', error);
    return {
      success: false,
      error: 'Failed to delete exercise',
      errorCode: 'EXERCISE_DELETE_FAILED',
    };
  }
}

export async function deleteExerciseEntry(entryId: string): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const db = await getDatabase();
    const entry = await db.collection<MongoDoc>('exercise_entries').findOne({
      _id: new ObjectId(entryId),
      userId: session.user.id,
    });

    if (!entry) {
      return { success: false, error: 'Exercise entry not found', errorCode: 'ENTRY_NOT_FOUND' };
    }

    const workoutSessionId = String(entry.workoutSessionId ?? entry.sessionId ?? '');
    if (!ObjectId.isValid(workoutSessionId)) {
      return { success: false, error: 'Workout session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    return deleteExerciseFromWorkout({ sessionId: workoutSessionId, entryId });
  } catch (error) {
    logActionError('Delete Exercise Entry Error', error);
    return {
      success: false,
      error: 'Failed to delete exercise',
      errorCode: 'EXERCISE_DELETE_FAILED',
    };
  }
}

export async function deleteSet(input: DeleteSetInput | string): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const validated = deleteSetSchema.parse(typeof input === 'string' ? { setId: input } : input);
    const db = await getDatabase();
    const ownedSet = await db.collection<MongoDoc>('exercise_sets').findOne({
      _id: new ObjectId(validated.setId),
      userId: session.user.id,
    });

    if (!ownedSet) {
      return { success: false, error: 'Set not found', errorCode: 'SET_NOT_FOUND' };
    }

    const result = await db.collection('exercise_sets').deleteOne({
      _id: new ObjectId(validated.setId),
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return { success: false, error: 'Set not found', errorCode: 'SET_NOT_FOUND' };
    }

    const workoutSessionId = String(ownedSet.workoutSessionId ?? ownedSet.sessionId ?? '');
    if (ObjectId.isValid(workoutSessionId)) {
      await db
        .collection('workout_sessions')
        .updateOne(sessionOwnershipQuery(workoutSessionId, session.user.id), {
          $set: { lastInteractionAt: new Date(), updatedAt: new Date() },
        });
    }

    return { success: true, data: true };
  } catch (error) {
    logActionError('Delete Set Error', error);
    return { success: false, error: 'Failed to delete set', errorCode: 'SET_DELETE_FAILED' };
  }
}

export async function finishWorkoutSession(
  sessionId: string,
  durationMs: number,
  totalVolumeKg: number,
): Promise<ActionResult<boolean>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED' };

    const db = await getDatabase();

    const result = await db.collection('workout_sessions').updateOne(
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

    if (result.matchedCount === 0) {
      return { success: false, error: 'Workout session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    return { success: true, data: true };
  } catch (error) {
    logActionError('Finish Workout Error', error);
    return {
      success: false,
      error: 'Failed to finish workout',
      errorCode: 'SESSION_FINISH_FAILED',
    };
  }
}
