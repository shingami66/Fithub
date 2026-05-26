/**
 * Structured logger for development and production.
 * Prevents console spam in production and formats errors safely.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type ErrorFingerprint =
  | 'DB_CONNECT_TIMEOUT'
  | 'DB_NETWORK_BLOCKED'
  | 'DB_AUTH_FAILED'
  | 'DB_DNS_FAILED'
  | 'DB_UNKNOWN'
  | 'EXERCISE_API_UNAVAILABLE'
  | 'USDA_API_UNAVAILABLE'
  | 'ACTION_VALIDATION_FAILED';

type LogMeta = Record<string, unknown>;

const SECRET_KEY_PATTERN = /(secret|token|password|credential|api[_-]?key|authorization|cookie)/i;

function sanitizeText(value: string) {
  return value
    .replace(/mongodb(?:\+srv)?:\/\/[^\s'"<>]+/gi, '[redacted MongoDB URI]')
    .replace(/\/\/([^:/\s]+):([^@\s]+)@/g, '//[redacted]:[redacted]@')
    .replace(/(password|pwd|authSource|authMechanism)=([^&\s]+)/gi, '$1=[redacted]')
    .replace(/(api[_-]?key|token|secret)=([^&\s]+)/gi, '$1=[redacted]');
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeText(value);
  if (typeof value !== 'object' || value === null) return value;
  if (Array.isArray(value)) return value.map(sanitizeValue);

  return Object.entries(value as Record<string, unknown>).reduce<LogMeta>((acc, [key, item]) => {
    acc[key] = SECRET_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeValue(item);
    return acc;
  }, {});
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message: sanitizeText(message),
      ...(meta && { meta: sanitizeValue(meta) }),
    };
  }

  info(message: string, meta?: LogMeta) {
    if (!this.isProduction) {
      console.info(`[INFO] ${sanitizeText(message)}`, meta ? sanitizeValue(meta) : '');
    }
  }

  warn(message: string, meta?: LogMeta) {
    if (!this.isProduction) {
      console.warn(`[WARN] ${sanitizeText(message)}`, meta ? sanitizeValue(meta) : '');
    } else {
      console.warn(JSON.stringify(this.formatMessage('warn', message, meta)));
    }
  }

  error(message: string, error?: unknown, meta?: LogMeta) {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: sanitizeText(error.message),
            ...(!this.isProduction && { stack: sanitizeText(error.stack ?? '') }),
          }
        : { error };

    if (!this.isProduction) {
      console.error(
        `[ERROR] ${sanitizeText(message)}`,
        sanitizeValue(errorDetails),
        meta ? sanitizeValue(meta) : '',
      );
    } else {
      console.error(
        JSON.stringify(this.formatMessage('error', message, { ...errorDetails, ...meta })),
      );
    }
  }

  errorFingerprint(fingerprint: ErrorFingerprint, message: string, meta?: LogMeta) {
    this.error(message, undefined, { fingerprint, ...meta });
  }

  debug(message: string, meta?: LogMeta) {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${sanitizeText(message)}`, meta ? sanitizeValue(meta) : '');
    }
  }
}

export const logger = new Logger();
