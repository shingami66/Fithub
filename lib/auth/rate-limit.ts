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

type ClientIpSource = 'x-vercel-forwarded-for' | 'x-forwarded-for' | 'x-real-ip' | 'unknown';
type ClientIpInfo = {
  value: string;
  source: ClientIpSource;
};
type HeaderGetter = {
  get(name: string): string | null;
};
type UpstashRedisRestConfig = {
  url: string;
  token: string;
};

let redis: Redis | null | undefined;
let loginLimiter: Ratelimit | null | undefined;
let registerIpLimiter: Ratelimit | null | undefined;
let registerIpEmailLimiter: Ratelimit | null | undefined;
let warnedMissingRateLimit = false;

export function getClientIpFromHeaders(headers: HeaderGetter): string {
  return getClientIpInfoFromHeaders(headers).value;
}

export function getClientIpInfoFromHeaders(headers: HeaderGetter): ClientIpInfo {
  if (isVercelRuntime()) {
    return (
      getFirstAvailableHeaderIp(headers, [
        'x-vercel-forwarded-for',
        'x-forwarded-for',
        'x-real-ip',
      ]) ?? getUnknownClientIp()
    );
  }

  if (process.env.NODE_ENV === 'production') {
    return getUnknownClientIp();
  }

  return (
    getFirstAvailableHeaderIp(headers, [
      'x-vercel-forwarded-for',
      'x-real-ip',
      'x-forwarded-for',
    ]) ?? getUnknownClientIp()
  );
}

export async function checkLoginRateLimit(
  ip: string,
  emailNormalized: string,
): Promise<RateLimitResult> {
  const limiter = getLoginLimiter();
  if (!limiter) return getUnavailableRateLimitResult();

  try {
    const result = await limiter.limit(
      `credentials-login:${getCompositeHashBucket([ip, emailNormalized])}`,
    );
    return result.success ? { ok: true } : { ok: false, reason: 'rate_limited' };
  } catch (error) {
    return getRateLimitFailureResult(error);
  }
}

export async function checkRegisterRateLimit(
  ip: string,
  emailNormalized: string,
  context: { ipSource: ClientIpSource },
): Promise<RateLimitResult> {
  const ipLimiter = getRegisterIpLimiter();
  const ipEmailLimiter = getRegisterIpEmailLimiter();
  if (!ipLimiter || !ipEmailLimiter) return getUnavailableRateLimitResult();

  try {
    const ipResult = await ipLimiter.limit(`credentials-register-ip:${getHashBucket(ip)}`);
    if (!ipResult.success) {
      auditRegistrationRateLimitBlock('register-ip', context.ipSource);
      return { ok: false, reason: 'rate_limited' };
    }

    const ipEmailResult = await ipEmailLimiter.limit(
      `credentials-register-ip-email:${getCompositeHashBucket([ip, emailNormalized])}`,
    );
    if (!ipEmailResult.success) {
      auditRegistrationRateLimitBlock('register-ip-email', context.ipSource);
      return { ok: false, reason: 'rate_limited' };
    }

    return { ok: true };
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
    emailBucket: getHashBucket(emailNormalized),
    reason,
    ipBucket: getIpBucket(ip),
  });
}

function getRedis() {
  if (redis !== undefined) return redis;

  const config = getUpstashRedisRestConfig();

  if (!config) {
    redis = null;
    return redis;
  }

  redis = new Redis(config);
  return redis;
}

function getUpstashRedisRestConfig(): UpstashRedisRestConfig | null {
  const canonicalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const canonicalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (canonicalUrl && canonicalToken) {
    return { url: canonicalUrl, token: canonicalToken };
  }

  const vercelIntegrationUrl = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const vercelIntegrationToken = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  if (vercelIntegrationUrl && vercelIntegrationToken) {
    return { url: vercelIntegrationUrl, token: vercelIntegrationToken };
  }

  return null;
}

function getLoginLimiter() {
  if (loginLimiter !== undefined) return loginLimiter;

  const client = getRedis();
  loginLimiter = client
    ? new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        prefix: getRateLimitPrefix(),
      })
    : null;

  return loginLimiter;
}

function getRegisterIpLimiter() {
  if (registerIpLimiter !== undefined) return registerIpLimiter;

  const client = getRedis();
  registerIpLimiter = client
    ? new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(20, '1 h'),
        prefix: getRateLimitPrefix(),
      })
    : null;

  return registerIpLimiter;
}

function getRegisterIpEmailLimiter() {
  if (registerIpEmailLimiter !== undefined) return registerIpEmailLimiter;

  const client = getRedis();
  registerIpEmailLimiter = client
    ? new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        prefix: getRateLimitPrefix(),
      })
    : null;

  return registerIpEmailLimiter;
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
  return getHashBucket(ip).slice(0, 12);
}

function getHashBucket(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function getCompositeHashBucket(parts: string[]) {
  return getHashBucket(parts.join('\0'));
}

function getRateLimitPrefix() {
  return `fithub:${getRateLimitEnvironment()}`;
}

function getRateLimitEnvironment() {
  const value = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local';
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'local';
}

function auditRegistrationRateLimitBlock(
  rateLimitType: 'register-ip' | 'register-ip-email',
  ipSource: ClientIpSource,
) {
  logger.warn('Credentials registration rate-limited.', {
    rateLimitType,
    ipSource,
    vercelEnv: process.env.VERCEL_ENV ?? 'local',
    result: 'blocked',
  });
}

function getFirstIpHeaderValue(headers: HeaderGetter, header: string): string | null {
  const firstValue = headers.get(header)?.split(',')[0]?.trim();
  return firstValue && isIpLikeValue(firstValue) ? firstValue : null;
}

function getFirstAvailableHeaderIp(
  headers: HeaderGetter,
  headerNames: Exclude<ClientIpSource, 'unknown'>[],
): ClientIpInfo | null {
  for (const header of headerNames) {
    const value = getFirstIpHeaderValue(headers, header);
    if (value) return { value, source: header };
  }

  return null;
}

function getUnknownClientIp(): ClientIpInfo {
  return { value: 'unknown', source: 'unknown' };
}

function isIpLikeValue(value: string) {
  return isIP(value) !== 0;
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
}
