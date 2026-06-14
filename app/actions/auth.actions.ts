'use server';

import { headers } from 'next/headers';
import { z } from 'zod/v4';
import {
  AuthUserAlreadyExistsError,
  createCredentialsUser,
  normalizeEmail,
} from '@/lib/services/auth-user.service';
import {
  RATE_LIMIT_ERROR_MESSAGE,
  checkRegisterRateLimit,
  getClientIpInfoFromHeaders,
} from '@/lib/auth/rate-limit';
import { logger } from '@/lib/utils/logger';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^[\x21-\x7E]+$/),
});
const REGISTRATION_FAILED_MESSAGE = 'Registration failed. Please try again.';

export type RegisterWithEmailPasswordResult = { ok: true } | { ok: false; error: string };

export async function registerWithEmailPassword(
  input: unknown,
): Promise<RegisterWithEmailPasswordResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: 'Enter a valid name, email, and password.' };
  }

  const emailNormalized = normalizeEmail(parsed.data.email);
  const clientIp = getClientIpInfoFromHeaders(headers());
  const rateLimit = await checkRegisterRateLimit(clientIp.value, emailNormalized, {
    ipSource: clientIp.source,
  });

  if (!rateLimit.ok) {
    return { ok: false, error: RATE_LIMIT_ERROR_MESSAGE };
  }

  try {
    await createCredentialsUser(parsed.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthUserAlreadyExistsError) {
      return { ok: false, error: REGISTRATION_FAILED_MESSAGE };
    }

    logger.error('Email/password registration failed safely.', error);

    return { ok: false, error: REGISTRATION_FAILED_MESSAGE };
  }
}
