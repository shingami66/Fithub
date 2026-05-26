import { logger, type ErrorFingerprint } from '@/lib/utils/logger';

export type DatabaseErrorCode =
  | 'DB_CONNECT_TIMEOUT'
  | 'DB_NETWORK_BLOCKED'
  | 'DB_AUTH_FAILED'
  | 'DB_DNS_FAILED'
  | 'DB_UNKNOWN';

export type SafeResult<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: DatabaseErrorCode; message: string };

export class DatabaseUnavailableError extends Error {
  errorCode: DatabaseErrorCode;

  constructor(errorCode: DatabaseErrorCode, message = 'Database is temporarily unavailable.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.errorCode = errorCode;
  }
}

const DEFAULT_DATABASE_TIMEOUT_MS = 5000;
const FRIENDLY_DATABASE_MESSAGE = 'Your data is temporarily unavailable. Please retry.';

function sanitizeErrorMessage(message: string) {
  return message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s'"<>]+/gi, '[redacted MongoDB URI]')
    .replace(/\/\/([^:/\s]+):([^@\s]+)@/g, '//[redacted]:[redacted]@')
    .replace(/(password|pwd|authSource|authMechanism)=([^&\s]+)/gi, '$1=[redacted]');
}

function getErrorText(error: unknown) {
  if (error instanceof DatabaseUnavailableError) return error.message;
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function normalizeDatabaseError(error: unknown): DatabaseUnavailableError {
  if (error instanceof DatabaseUnavailableError) return error;

  const rawText = getErrorText(error);
  const text = rawText.toLowerCase();

  if (
    text.includes('authentication failed') ||
    text.includes('auth failed') ||
    text.includes('bad auth') ||
    text.includes('not authorized')
  ) {
    return new DatabaseUnavailableError('DB_AUTH_FAILED', FRIENDLY_DATABASE_MESSAGE);
  }

  if (
    text.includes('querysrv') ||
    text.includes('querytxt') ||
    text.includes('enotfound') ||
    text.includes('getaddrinfo') ||
    text.includes('dns')
  ) {
    return new DatabaseUnavailableError('DB_DNS_FAILED', FRIENDLY_DATABASE_MESSAGE);
  }

  if (
    text.includes('timed out') ||
    text.includes('timeout') ||
    text.includes('etimedout') ||
    text.includes('server selection')
  ) {
    return new DatabaseUnavailableError('DB_CONNECT_TIMEOUT', FRIENDLY_DATABASE_MESSAGE);
  }

  if (
    text.includes('econnrefused') ||
    text.includes('econnreset') ||
    text.includes('network') ||
    text.includes('connection closed') ||
    text.includes('socket')
  ) {
    return new DatabaseUnavailableError('DB_NETWORK_BLOCKED', FRIENDLY_DATABASE_MESSAGE);
  }

  return new DatabaseUnavailableError('DB_UNKNOWN', FRIENDLY_DATABASE_MESSAGE);
}

export async function withDatabaseTimeout<T>(
  operation: Promise<T> | (() => Promise<T>),
  timeoutMs = DEFAULT_DATABASE_TIMEOUT_MS,
): Promise<T> {
  let operationPromise: Promise<T>;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    operationPromise = typeof operation === 'function' ? operation() : operation;
  } catch (error) {
    throw normalizeDatabaseError(error);
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new DatabaseUnavailableError('DB_CONNECT_TIMEOUT', FRIENDLY_DATABASE_MESSAGE));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operationPromise, timeoutPromise]);
  } catch (error) {
    throw normalizeDatabaseError(error);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    operationPromise.catch(() => undefined);
  }
}

export async function safeMongoOperation<T>(
  operation: () => Promise<T>,
  options: {
    timeoutMs?: number;
    operationName?: string;
    meta?: Record<string, unknown>;
  } = {},
): Promise<SafeResult<T>> {
  try {
    const data = await withDatabaseTimeout(operation, options.timeoutMs);
    return { ok: true, data };
  } catch (error) {
    const normalized = normalizeDatabaseError(error);
    logger.errorFingerprint(
      normalized.errorCode as ErrorFingerprint,
      options.operationName ?? 'MongoDB operation failed',
      {
        ...options.meta,
        message: sanitizeErrorMessage(getErrorText(error)),
      },
    );

    return {
      ok: false,
      errorCode: normalized.errorCode,
      message: FRIENDLY_DATABASE_MESSAGE,
    };
  }
}
