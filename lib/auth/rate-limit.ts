import 'server-only';

import { createHash } from 'crypto';
import { isIP } from 'net';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/utils/logger';

export const RATE_LIMIT_ERROR_MESSAGE = 'Too many attempts. Please try again later.';
export const RATE_LIMIT_ERROR_CODE = 'TooManyAttempts';

type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: 'rate_limited' | 'rate_limit_unavailable' };

type FailureReason =
  | 'invalid_credentials'
  | 'rate_limited'
  | 'provider_mismatch'
  | 'malformed_hash';

let redis: Redis | null | undefined;
let loginLimiter: Ratelimit | null | undefined;
let registerLimiter: Ratelimit | null | undefined;
let warnedMissingRateLimit = false;

export function getClientIpFromHeaders(headers: Headers): string {
  if (isVercelRuntime()) {
    return (
      getFirstIpHeaderValue(headers, 'x-vercel-forwarded-for') ??
      getFirstIpHeaderValue(headers, 'x-forwarded-for') ??
      getFirstIpHeaderValue(headers, 'x-real-ip') ??
      'unknown'
    );
  }

  if (process.env.NODE_ENV === 'production') {
    return 'unknown';
  }

  return (
    getFirstIpHeaderValue(headers, 'x-vercel-forwarded-for') ??
    getFirstIpHeaderValue(headers, 'x-real-ip') ??
    getFirstIpHeaderValue(headers, 'x-forwarded-for') ??
    'unknown'
  );
}

export async function checkLoginRateLimit(
  ip: string,
  emailNormalized: string,
): Promise<RateLimitResult> {
  const limiter = getLoginLimiter();
  if (!limiter) return getUnavailableRateLimitResult();

  try {
    const result = await limiter.limit(`credentials-login:${ip}:${emailNormalized}`);
    return result.success ? { ok: true } : { ok: false, reason: 'rate_limited' };
  } catch (error) {
    return getRateLimitFailureResult(error);
  }
}

export async function checkRegisterRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getRegisterLimiter();
  if (!limiter) return getUnavailableRateLimitResult();

  try {
    const result = await limiter.limit(`credentials-register:${ip}`);
    return result.success ? { ok: true } : { ok: false, reason: 'rate_limited' };
  } catch (error) {
    return getRateLimitFailureResult(error);
  }
}

export function auditCredentialsLoginFailure({
  emailNormalized,
  reason,
  ip,
}: {
  emailNormalized: string;
  reason: FailureReason;
  ip: string;
}) {
  logger.warn('Credentials login failed.', {
    emailNormalized,
    reason,
    ipBucket: getIpBucket(ip),
  });
}

function getRedis() {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redis = null;
    return redis;
  }

  redis = new Redis({ url, token });
  return redis;
}

function getLoginLimiter() {
  if (loginLimiter !== undefined) return loginLimiter;

  const client = getRedis();
  loginLimiter = client
    ? new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        prefix: 'project-pulse',
      })
    : null;

  return loginLimiter;
}

function getRegisterLimiter() {
  if (registerLimiter !== undefined) return registerLimiter;

  const client = getRedis();
  registerLimiter = client
    ? new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        prefix: 'project-pulse',
      })
    : null;

  return registerLimiter;
}

function getUnavailableRateLimitResult(): RateLimitResult {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Credentials auth blocked because rate limiting is not configured.');
    return { ok: false, reason: 'rate_limit_unavailable' };
  }

  if (!warnedMissingRateLimit) {
    logger.warn(
      'Credentials auth rate limiting is not configured; allowing local development fallback.',
    );
    warnedMissingRateLimit = true;
  }

  return { ok: true };
}

function getRateLimitFailureResult(error: unknown): RateLimitResult {
  logger.error('Credentials auth rate limit check failed safely.', error);

  if (process.env.NODE_ENV === 'production') {
    return { ok: false, reason: 'rate_limit_unavailable' };
  }

  return { ok: true };
}

function getIpBucket(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 12);
}

function getFirstIpHeaderValue(headers: Headers, header: string): string | null {
  return (
    headers
      .get(header)
      ?.split(',')
      .map((value) => value.trim())
      .find(isIpLikeValue) ?? null
  );
}

function isIpLikeValue(value: string) {
  return isIP(value) !== 0;
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
}
