# Email and Password Authentication

Project Pulse supports two login options:

- Google OAuth through NextAuth.
- Email and password through NextAuth CredentialsProvider.

Both providers resolve to the same clean user id strategy: `session.user.id` is always the MongoDB `users._id.toString()` for new sign-ins.

## Flow

Credentials registration calls `registerWithEmailPassword`, validates the input with Zod, checks duplicate email ownership, hashes the password, and writes a `users` document.

Credentials login calls `signIn("credentials")`. The provider validates input, applies rate limiting, verifies the password, and returns a user object with MongoDB `_id` as `id`.

Google login remains available. On Google sign-in, NextAuth upserts or loads a `users` document and stores the MongoDB `_id` in the JWT/session.

## Password Hashing

Passwords are hashed in `lib/auth/password.ts` using Node's built-in async `crypto.scrypt`.

Parameters:

- `N = 16384`
- `r = 8`
- `p = 1`
- `keyLen = 64`
- `saltLength = 16 bytes`

Stored format:

```text
scrypt:v1:N=16384,r=8,p=1:<saltHex>:<hashHex>
```

Plain text passwords are never stored. Password hashes, salts, tokens, and secrets must never be logged.

## Timing Protection

Missing users and provider mismatches still run password verification against a precomputed dummy scrypt hash. This keeps missing-user and wrong-password paths closer in cost and avoids returning before scrypt work is performed.

Malformed hashes are handled safely: verification logs a safe warning without hash material, performs dummy work, and returns `false`.

## Rate Limiting

Credentials auth uses Upstash Redis and `@upstash/ratelimit`.

Limits:

- Login: 5 attempts per 10 minutes per `ip + emailNormalized`.
- Register: 3 attempts per hour per IP.

Required Vercel environment variables:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

If these variables are missing in production, credentials login/register is blocked safely. In development, a warning is logged and local fallback is allowed.

## Client IP

Client IP is read only from request headers, never from body/query/user input.

Priority:

1. `x-vercel-forwarded-for`
2. `x-real-ip`
3. `x-forwarded-for`
4. `unknown`

For comma-separated headers, the first non-empty value is used. If the IP is `unknown`, users share the `unknown` rate-limit bucket.

## Generic Login Errors

Credentials login always shows:

```text
Invalid email or password
```

This avoids revealing whether an email exists, whether a password is wrong, or whether the account belongs to another provider.

## Email Collision Policy

Duplicate emails across providers are blocked.

- If a Google email already exists, credentials registration returns `Email already exists`.
- If a credentials email already exists, Google sign-in is rejected and the user is told to use email/password.

Account linking is deferred. It should only be added after email verification exists.

## Existing Demo Data

Old demo/test data may be orphaned because prior Google sessions used the Google provider id, while the clean architecture uses MongoDB `users._id`.

No migration is attempted.

Optional manual cleanup script:

```bash
pnpm dlx tsx scripts/reset-demo-user-data.ts --confirm-demo-reset
```

The script is for demo/dev data only, does not run automatically, and clears:

- `userProfiles`
- `nutrition_logs`
- `workout_sessions`
- `exercise_entries`
- `exercise_sets`
- `food_entries`

Do not run this script against production data.

## NEXTAUTH_SECRET

`NEXTAUTH_SECRET` must be a random string of at least 32 bytes.

Generate it with:

```bash
openssl rand -base64 32
```

Never commit this value. Store it only in `.env.local` and Vercel Environment Variables.

## Future Hardening

Deferred features:

- Email verification.
- Reset password.
- Account linking.
- 2FA.
- Stronger abuse detection.
- Account lockout/throttling.
- Audit dashboard.
