import 'server-only';

import { ObjectId, type Collection, type Filter } from 'mongodb';
import { getDatabase } from '@/lib/db/mongodb';
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  isPasswordHashFormatValid,
  verifyPassword,
} from '@/lib/auth/password';
import { logger } from '@/lib/utils/logger';

export type AuthProvider = 'credentials' | 'google';
export type CredentialsFailureReason =
  | 'invalid_credentials'
  | 'provider_mismatch'
  | 'malformed_hash';

export type AuthUserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  emailNormalized?: string;
  passwordHash?: string;
  authProvider?: AuthProvider;
  provider?: AuthProvider;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export class AuthUserAlreadyExistsError extends Error {
  constructor() {
    super('Email already exists');
    this.name = 'AuthUserAlreadyExistsError';
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmailNormalized(
  emailNormalized: string,
): Promise<AuthUserDocument | null> {
  const normalized = normalizeEmail(emailNormalized);
  if (!normalized) return null;

  const users = await getUsersCollection();
  const directMatch = await users.findOne({ emailNormalized: normalized });
  if (directMatch) return directMatch;

  return users.findOne(
    { email: normalized },
    {
      collation: { locale: 'en', strength: 2 },
    },
  );
}

export async function createCredentialsUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthSessionUser> {
  const emailNormalized = normalizeEmail(email);
  await ensureUsersIndexes();

  const existingUser = await findUserByEmailNormalized(emailNormalized);
  if (existingUser) {
    throw new AuthUserAlreadyExistsError();
  }

  const now = new Date();
  const passwordHash = await hashPassword(password);
  const users = await getUsersCollection();

  try {
    const userId = new ObjectId();
    const document: AuthUserDocument = {
      _id: userId,
      name: name.trim(),
      email: email.trim(),
      emailNormalized,
      passwordHash,
      authProvider: 'credentials',
      image: null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await users.insertOne(document);

    return {
      id: result.insertedId.toString(),
      name: name.trim(),
      email: email.trim(),
      image: null,
    };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AuthUserAlreadyExistsError();
    }

    throw error;
  }
}

export async function validateCredentialsUser(
  email: string,
  password: string,
): Promise<{ ok: true; user: AuthSessionUser } | { ok: false; reason: CredentialsFailureReason }> {
  const emailNormalized = normalizeEmail(email);
  const user = await findUserByEmailNormalized(emailNormalized);

  if (!user) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    return { ok: false, reason: 'invalid_credentials' };
  }

  if (getUserProvider(user) !== 'credentials') {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    return { ok: false, reason: 'provider_mismatch' };
  }

  if (!isPasswordHashFormatValid(user.passwordHash)) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    return { ok: false, reason: 'malformed_hash' };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  return { ok: true, user: toSessionUser(user) };
}

export async function upsertGoogleUserFromOAuth({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<AuthUserDocument> {
  const emailNormalized = normalizeEmail(email);
  await ensureUsersIndexes();

  const existingUser = await findUserByEmailNormalized(emailNormalized);
  const provider = existingUser ? getUserProvider(existingUser) : null;

  if (existingUser && (provider === 'credentials' || existingUser.passwordHash)) {
    return existingUser;
  }

  const users = await getUsersCollection();
  const now = new Date();
  const filter: Filter<AuthUserDocument> = existingUser
    ? { _id: existingUser._id }
    : { emailNormalized };

  const result = await users.findOneAndUpdate(
    filter,
    {
      $set: {
        email: email.trim(),
        emailNormalized,
        authProvider: 'google',
        name: name?.trim() || existingUser?.name || emailNormalized,
        image: image ?? existingUser?.image ?? null,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  if (!result) {
    throw new Error('Failed to upsert Google user.');
  }

  return result;
}

export async function ensureUsersIndexes() {
  try {
    const users = await getUsersCollection();
    await users.createIndex(
      { emailNormalized: 1 },
      {
        unique: true,
        name: 'users_emailNormalized_unique',
        partialFilterExpression: { emailNormalized: { $type: 'string' } },
      },
    );
  } catch (error) {
    logger.warn('Could not verify users.emailNormalized unique index.', {
      error: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}

export function getUserProvider(user: AuthUserDocument): AuthProvider | null {
  return user.authProvider ?? user.provider ?? null;
}

export function toSessionUser(user: AuthUserDocument): AuthSessionUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };
}

async function getUsersCollection(): Promise<Collection<AuthUserDocument>> {
  const db = await getDatabase();
  return db.collection<AuthUserDocument>('users');
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}
