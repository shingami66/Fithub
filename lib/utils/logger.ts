/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Structured logger for development and production.
 * Prevents console spam in production and formats errors safely.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };
  }

  info(message: string, meta?: any) {
    if (!this.isProduction) {
      console.log(`[INFO] ${message}`, meta ? meta : '');
    } else {
      console.log(JSON.stringify(this.formatMessage('info', message, meta)));
    }
  }

  warn(message: string, meta?: any) {
    if (!this.isProduction) {
      console.warn(`[WARN] ${message}`, meta ? meta : '');
    } else {
      console.warn(JSON.stringify(this.formatMessage('warn', message, meta)));
    }
  }

  error(message: string, error?: any, meta?: any) {
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error };

    if (!this.isProduction) {
      console.error(`[ERROR] ${message}`, errorDetails, meta ? meta : '');
    } else {
      console.error(
        JSON.stringify(this.formatMessage('error', message, { ...errorDetails, ...meta })),
      );
    }
  }

  debug(message: string, meta?: any) {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, meta ? meta : '');
    }
  }
}

export const logger = new Logger();
