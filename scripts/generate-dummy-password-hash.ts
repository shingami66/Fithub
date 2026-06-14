import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

async function main() {
  const N = 2 ** 14;
  const r = 8;
  const p = 1;
  const keyLen = 64;
  const salt = randomBytes(16);
  const hash = await scryptAsync('project-pulse-dummy-password', salt, keyLen, {
    N,
    r,
    p,
    maxmem: 64 * 1024 * 1024,
  });

  console.log(`scrypt:v1:N=${N},r=${r},p=${p}:${salt.toString('hex')}:${hash.toString('hex')}`);
}

main().catch(() => {
  process.exitCode = 1;
});
