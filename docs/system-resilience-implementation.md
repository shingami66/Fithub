# System Resilience Implementation

## 1. Root Causes Fixed

- Protected Server Components were directly awaiting MongoDB reads and analytics queries. Slow Atlas connections could throw into React Server Components and crash full routes.
- Dashboard analytics were fetched as one `Promise.all`, so one failed non-critical query blocked the whole page.
- Profile/onboarding reads were treated as mandatory on workout and nutrition even when the DB was temporarily unavailable.
- API search failures were logged as raw errors and could fail silently in the UI.
- Recharts relied on percentage heights without a shared explicit chart parent.
- Delete flows existed only partially and did not consistently show success/error recovery feedback.

## 2. Files Changed

- `lib/db/safe-db.ts`
- `lib/utils/logger.ts`
- `lib/services/user-profile.service.ts`
- `lib/services/exercise.service.ts`
- `lib/services/nutrition.service.ts`
- `lib/utils/search-normalizers.ts`
- `app/dashboard/page.tsx`
- `app/dashboard/analytics/page.tsx`
- `app/dashboard/workout/page.tsx`
- `app/dashboard/nutrition/page.tsx`
- `app/dashboard/profile/page.tsx`
- `app/dashboard/onboarding/page.tsx`
- `app/actions/workout.actions.ts`
- `app/actions/nutrition.actions.ts`
- `app/api/exercises/search/route.ts`
- `app/api/nutrition/search/route.ts`
- `components/states/database-unavailable-state.tsx`
- `components/dashboard/server/*`
- `components/charts/chart-shell.tsx`
- `components/dashboard/*chart.tsx`
- `components/dashboard/weekly-streak.tsx`
- `components/workout/*`
- `components/nutrition/*`
- `docs/debugging-guide.md`

## 3. New Resilience Architecture

MongoDB reads now have a typed safety boundary: `safeMongoOperation()` runs work through `withDatabaseTimeout()` and returns `{ ok: true, data }` or `{ ok: false, errorCode, message }`. Known DB failures normalize into safe fingerprints: `DB_CONNECT_TIMEOUT`, `DB_NETWORK_BLOCKED`, `DB_AUTH_FAILED`, `DB_DNS_FAILED`, and `DB_UNKNOWN`.

Dashboard analytics moved into independent server widgets with Suspense fallbacks, so the shell and unaffected widgets survive slow or failed analytics.

## 4. When DB Is Slow

Pages render friendly recovery UI instead of raw Mongo errors. Dashboard/profile show `DatabaseUnavailableState`; workout shows a recoverable session-restore state; nutrition opens with zeroed targets/logs and visible warnings.

## 5. When APIs Fail

ExerciseDB and USDA route failures return friendly 502 JSON errors and emit safe fingerprints: `EXERCISE_API_UNAVAILABLE` and `USDA_API_UNAVAILABLE`. Search sheets display visible errors.

## 6. Arabic Search Behavior

Arabic aliases are normalized before external search. Examples: `صدر` -> `chest`, `سكوات` -> `squat`, `بيض` -> `egg`, and `صدر دجاج` -> `chicken breast`. English search is passed through unchanged.

## 7. Delete Behavior

Workout sets and exercises delete optimistically with compact confirmation buttons, rollback on failure, and success/error toasts. Nutrition food entries delete optimistically, totals update immediately, and failures restore the prior log state.

## 8. Remaining Known Limitations

- Pause/resume persistence is modeled in client timer state, but no pause/resume server actions or buttons were added in this sprint.
- Full happy-path add/delete QA needs a reachable MongoDB Atlas connection with a seeded/onboarded user.
- Recharts warning verification with real chart data needs MongoDB-backed analytics data.

## 9. Manual QA Results

- `pnpm lint`: passed.
- `npx next build`: passed.
- Local browser smoke with `DEV_AUTH_BYPASS=true` and MongoDB currently timing out:
  - `/dashboard`: rendered app shell and recoverable DB unavailable state.
  - `/dashboard/workout`: rendered recoverable workout session restore state.
  - `/dashboard/nutrition`: rendered nutrition page with visible DB/profile warnings and no crash.
  - `/dashboard/profile`: rendered recoverable DB unavailable state.
- API checks:
  - `/api/nutrition/search?q=بيض`: returned egg results.
  - `/api/nutrition/search?query=egg`: returned egg results.
  - `/api/exercises/search?q=صدر`: returned chest exercise results.
- Clean-browser guidance and extension-noise classification are documented in `docs/debugging-guide.md`.
