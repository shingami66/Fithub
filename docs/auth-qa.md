# Auth QA

Date: 2026-05-24

## Local Google OAuth Setup

1. Use one local dev URL for both NextAuth and the running server.

   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Start the app on the same port:

   ```bash
   pnpm dev -- -p 3000
   ```

3. Keep Google credentials in `.env.local`:

   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXTAUTH_SECRET=...
   ```

4. Open `http://localhost:3000/login`.
5. Click `Sign in with Google`.
6. Confirm Google opens its account sign-in page and does not show `redirect_uri_mismatch`.

## Callback URL Requirements

The Google Cloud Console OAuth client must include this Authorized redirect URI for local QA:

```text
http://localhost:3000/api/auth/callback/google
```

The callback URL is derived from `NEXTAUTH_URL`. If the app is started on a different local port, update both:

- `.env.local` `NEXTAUTH_URL`
- Google Cloud Console Authorized redirect URI

Examples:

```text
NEXTAUTH_URL=http://localhost:3000
Callback: http://localhost:3000/api/auth/callback/google
```

```text
NEXTAUTH_URL=http://localhost:3003
Callback: http://localhost:3003/api/auth/callback/google
```

During QA, `http://localhost:3003` produced `redirect_uri_mismatch` because the Google OAuth client did not include the port-3003 callback. Returning to `http://localhost:3000` produced the normal Google sign-in page.

## DEV_AUTH_BYPASS Safety Rules

`DEV_AUTH_BYPASS` is for local manual QA only.

Default:

```env
DEV_AUTH_BYPASS=false
```

Rules:

- It only works when `NODE_ENV=development`.
- It is ignored in production because the runtime check requires `process.env.NODE_ENV === 'development'`.
- It returns a local-only QA session for `dev-test-user`.
- Keep it `false` for normal OAuth QA.
- If it is set to `true`, app startup prints a warning.
- Never add `dev-test-user` documents to production fixtures or seeded data.

Cleanup query for local QA data:

```js
db.workout_sessions.deleteMany({ userId: 'dev-test-user' });
db.exercise_entries.deleteMany({ userId: 'dev-test-user' });
db.exercise_sets.deleteMany({ userId: 'dev-test-user' });
db.nutrition_logs.deleteMany({ userId: 'dev-test-user' });
db.userProfiles.deleteMany({ userId: 'dev-test-user' });
```

## Verified Locally

- `DEV_AUTH_BYPASS=false` in `.env.local`.
- Protected dashboard route redirects to `/login` without a session.
- Google sign-in uses `redirect_uri=http://localhost:3000/api/auth/callback/google`.
- Google opens the normal account identifier page on port `3000`.
- Startup warning prints when `DEV_AUTH_BYPASS=true`.
- Existing `dev-test-user` QA records were removed from configured MongoDB collections.
