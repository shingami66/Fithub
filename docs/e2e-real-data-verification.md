# Sprint 13 E2E Real Data Verification

Date: 2026-05-24

## Tested Flows

- Workout session recovery now calls `createOrRestoreSession`, restores the authenticated user's active MongoDB session, and hydrates saved exercise entries plus sets.
- Exercise search uses `/api/exercises/search`, which proxies ExerciseDB through the server and reports unavailable or invalid responses instead of silently returning empty successful data.
- Selecting an exercise saves a real `exercise_entries` document and initial `exercise_sets` document scoped to `userId`.
- Adding sets writes `exercise_sets` documents scoped to `userId`; set edits and completion state persist through `updateSet`.
- Nutrition date loading calls `getNutritionLogs` for the selected date and authenticated `userId`.
- USDA search uses `/api/nutrition/search`, validates the response shape, and reports unavailable or invalid responses.
- Selecting a food saves a MongoDB `nutrition_logs` entry through `addFoodEntryToLog`.
- Nutrition calories and macros are calculated from saved food entries, not static page constants.
- `/dashboard` reads MongoDB-backed nutrition totals, workout activity, weekly activity, weekly performance, and recovery data.
- `/dashboard/analytics` reads MongoDB-backed workout volume, nutrition trends, muscle frequency, recovery score, and weekly performance data.

## Local Verification Run

- `pnpm lint` passed.
- `npx next build` passed.
- `GET /api/exercises/search?q=push` returned 10 ExerciseDB-backed results locally.
- `GET /api/nutrition/search?query=apple` returned 20 USDA-backed results locally.
- Browser navigation to `/dashboard/workout` on the clean local dev server redirected to `/login?callbackUrl=%2Fdashboard%2Fworkout`, so the full click-through persistence flow requires signing in with Google before it can be completed in-browser.

## Remaining Mocked Areas

- No non-real dashboard/workout/nutrition data remains in the audited app flows.
- The public landing phone preview remains an illustrative static marketing preview and is not used for authenticated dashboard, workout, nutrition, or analytics data.

## Known Limitations

- Manual browser verification requires an authenticated Google session, valid `MONGODB_URI`, `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, and `USDA_API_KEY` in `.env.local`.
- Recovery score is a simple real-data heuristic from completed workout frequency because no sleep/readiness data source exists yet.
- Active workout dashboard volume reflects saved set weight and reps; completed weekly volume charts count completed sets.
- Nutrition entries use USDA's returned serving text and macro values as provided by FoodData Central.

## Next Fixes

- Add automated authenticated integration tests for workout session restore and nutrition date restore.
- Add user-facing retry affordances for failed set saves.
- Add a migration or cleanup task for any legacy workout documents that used `sessionId` or `entryId` instead of `workoutSessionId` or `exerciseEntryId`.
