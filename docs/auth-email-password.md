# Email and Password Authentication

Project Pulse supports two login options:

- Google OAuth through NextAuth.
- Email and password through NextAuth CredentialsProvider.

Both providers resolve to the same clean user id strategy: `session.user.id` is always the MongoDB `users._id.toString()` for new sign-ins.

## Flow

Credentials registration calls `registerWithEmailPassword`, validates the input with Zod, hashes the password, checks duplicate email ownership, and writes a `users` document.

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

## Password Policy

Registration requires passwords to be at least 8 characters and at most 128 characters.

This release does not enforce character-class complexity rules. That is an accepted tradeoff for usability and compatibility with password managers. Future hardening should add common-password and breached-password checks rather than arbitrary composition rules.

## Timing Protection

Missing users and provider mismatches still run password verification against a precomputed dummy scrypt hash. This keeps missing-user and wrong-password paths closer in cost and avoids returning before scrypt work is performed.

Malformed hashes are handled safely: verification logs a safe warning without hash material, performs dummy work, and returns `false`.

## Rate Limiting

Credentials auth uses Upstash Redis and `@upstash/ratelimit`.

Limits:

- Login: 5 attempts per 10 minutes per `ip + emailNormalized`.
- Register global IP layer: 20 attempts per hour per client IP.
- Register IP + email layer: 3 attempts per hour per `ip + emailNormalized`.

Redis keys are namespaced by environment, for example `fithub:preview` or `fithub:production`, so Preview and Production do not share active rate-limit buckets. Raw IP addresses and raw email addresses are not stored in Redis keys; deterministic server-side SHA-256 hashes are used for key parts.

Supported Vercel environment variable pairs:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

or, when using the Vercel Upstash Redis integration:

```text
UPSTASH_REDIS_REST_KV_REST_API_URL
UPSTASH_REDIS_REST_KV_REST_API_TOKEN
```

The canonical `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` pair is preferred when both are present. The Vercel integration may create the `REST_API_URL` + `REST_API_TOKEN` names automatically, and those are used as a fallback. The read-only token is not used because rate limiting must write Redis counters.

If these variables are missing in production, credentials login/register is blocked safely. In development, a warning is logged and local fallback is allowed.

## Client IP

Client IP is read-only from request headers, never from body/query/user input.

Vercel runtime priority:

1. `x-vercel-forwarded-for`
2. `x-forwarded-for`
3. `x-real-ip`
4. `unknown`

Vercel sets or overwrites forwarded IP headers for deployments, so Vercel Preview and Production use those platform-provided headers for rate-limit identity. Outside Vercel production, forwarded headers are not trusted and the shared `unknown` bucket is used instead.

Development priority:

1. `x-vercel-forwarded-for`
2. `x-real-ip`
3. `x-forwarded-for`
4. `unknown`

For comma-separated headers, the first value is trimmed and used only if it is IP-like.

## Generic Auth Errors

Credentials login always shows:

```text
Invalid email or password
```

This avoids revealing whether an email exists, whether a password is wrong, or whether the account belongs to another provider.

Credentials registration also returns a generic failure for duplicate email/collision paths:

```text
Registration failed. Please try again.
```

The server still blocks duplicates, but the response avoids confirming whether an email address already has an account.
Duplicate/collision handling happens after the password hashing work in the credentials user creation path, and duplicate-key races are collapsed into the same generic response.

## Email Collision Policy

Duplicate emails across providers are blocked.

- If a Google email already exists, credentials registration is blocked with a generic registration failure.
- If a credentials email already exists, Google sign-in is rejected and the user is told to use email/password.

Account linking is deferred. It should only be added after email verification exists.

## Existing Demo Data

Old demo/test data may be orphaned because prior Google sessions used the Google provider id, while the clean architecture uses MongoDB `users._id`.

No migration is attempted.

Optional manual cleanup script:

```bash
pnpm dlx tsx scripts/reset-demo-user-data.ts --confirm-demo-reset --confirm-db=<dbName>
```

The script is for demo/dev data only, does not run automatically, and clears:

- `userProfiles`
- `nutrition_logs`
- `workout_sessions`
- `exercise_entries`
- `exercise_sets`
- `food_entries`

Do not run this script against production data.

The script refuses to run unless:

- `--confirm-demo-reset` is present.
- `--confirm-db=<dbName>` exactly matches the parsed MongoDB database name.
- The database name has a clear non-production token, such as `dev`, `demo`, `test`, `local`, or `staging`, separated by start/end, hyphen, underscore, dot, or whitespace boundaries.
- The database name does not have a production-like token, such as `prod`, `production`, `main`, or `live`, using the same token boundaries.

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
