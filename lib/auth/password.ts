import 'server-only';

import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { logger } from '@/lib/utils/logger';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

type ScryptOptions = {
  N: number;
  r: number;
  p: number;
  maxmem: number;
};

const ALGORITHM = 'scrypt';
const VERSION = 'v1';
const COST_N = 2 ** 14;
const COST_R = 8;
const COST_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAXMEM = 64 * 1024 * 1024;
const PARAMS = `N=${COST_N},r=${COST_R},p=${COST_P}`;
const HEX_PATTERN = /^[0-9a-f]+$/i;

export const DUMMY_PASSWORD_HASH =
  'scrypt:v1:N=16384,r=8,p=1:1a74036c040dbd2444054a075d8705d0:daa1c3711fdcc537b2e04d013b7e05bf9ee43c0ebfc80ca6e5bfd6171426a67ee50550c1de900ce5af43a0a9b5464b5c2c2a0547d3406bcf2c8c6dc9d12532e4';

type ParsedPasswordHash = {
  salt: Buffer;
  hash: Buffer;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, {
    N: COST_N,
    r: COST_R,
    p: COST_P,
    maxmem: MAXMEM,
  });

  return `${ALGORITHM}:${VERSION}:${PARAMS}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parsed = parsePasswordHash(storedHash);

  if (!parsed) {
    logger.warn('Unsupported or malformed password hash encountered.');
    await runDummyPasswordWorkSafely(password);
    return false;
  }

  try {
    const candidateHash = await scryptAsync(password, parsed.salt, KEY_LENGTH, {
      N: COST_N,
      r: COST_R,
      p: COST_P,
      maxmem: MAXMEM,
    });

    if (candidateHash.length !== parsed.hash.length) {
      await runDummyPasswordWorkSafely(password);
      return false;
    }

    return timingSafeEqual(candidateHash, parsed.hash);
  } catch (error) {
    logger.warn('Password verification failed safely.', {
      error: error instanceof Error ? error.name : 'UnknownError',
    });
    await runDummyPasswordWorkSafely(password);
    return false;
  }
}

export function isPasswordHashFormatValid(storedHash: string | undefined): storedHash is string {
  return parsePasswordHash(storedHash) !== null;
}

function parsePasswordHash(storedHash: string | undefined): ParsedPasswordHash | null {
  if (!storedHash) return null;

  const parts = storedHash.split(':');
  if (parts.length !== 5) return null;

  const [algorithm, version, params, saltHex, hashHex] = parts;
  if (algorithm !== ALGORITHM || version !== VERSION || params !== PARAMS) return null;
  if (!isValidHex(saltHex, SALT_LENGTH) || !isValidHex(hashHex, KEY_LENGTH)) return null;

  return {
    salt: Buffer.from(saltHex, 'hex'),
    hash: Buffer.from(hashHex, 'hex'),
  };
}

function isValidHex(value: string, expectedBytes: number) {
  return value.length === expectedBytes * 2 && HEX_PATTERN.test(value);
}

async function runDummyPasswordWork(password: string) {
  const dummy = parsePasswordHash(DUMMY_PASSWORD_HASH);
  if (!dummy) return;

  await scryptAsync(password, dummy.salt, KEY_LENGTH, {
    N: COST_N,
    r: COST_R,
    p: COST_P,
    maxmem: MAXMEM,
  });
}

async function runDummyPasswordWorkSafely(password: string) {
  try {
    await runDummyPasswordWork(password);
  } catch (error) {
    logger.warn('Dummy password verification failed safely.', {
      error: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}
