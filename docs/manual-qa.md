# Manual QA

Date: 2026-05-24

## Current QA Run Notes

- `pnpm lint` passed.
- `npx next build` passed when run standalone.
- A development-only QA server was started with `DEV_AUTH_BYPASS=true` on `http://localhost:3014`; startup printed the expected bypass warning.
- `http://localhost:3014/api/exercises/search?q=صدر` returned real ExerciseDB results, confirming Arabic-to-English normalization.
- `http://localhost:3014/api/nutrition/search?query=egg` returned `Eggs, Grade A, Large, egg whole` as the top result with `1 large egg (50g)` and `74 kcal`.
- Full persistence QA is blocked until local MongoDB is running. Current `.env.local` points MongoDB at `localhost:27017`, which refused connections during this pass.
- The current ExerciseDB RapidAPI response in this environment does not include `gifUrl`, `image`, or thumbnail fields. The UI reads those fields when present and shows the fallback icon when the provider omits them.

## Sprint 14 Critical UX QA

Use the actual local server URL in `.env.local` as `NEXTAUTH_URL` before testing Google OAuth. For the default local server this is:

```env
NEXTAUTH_URL=http://localhost:3000
DEV_AUTH_BYPASS=false
```

### Onboarding Plan Flow

1. Sign in with Google.
2. If the profile is new or incomplete, confirm the app routes to `/dashboard/onboarding`.
3. Complete weight, height, age, gender, activity level, goal, and weekly target.
4. Confirm the summary shows BMR, TDEE, calorie target, protein, carbs, and fat.
5. Select `lose 1 kg/week` once and confirm the aggressive-deficit warning appears.
6. Submit and confirm `/dashboard`, `/dashboard/nutrition`, and `/dashboard/profile` use the saved targets.

### Workout Flow

1. Open `/dashboard/workout`.
2. Confirm the timer shows `00:00` and does not start automatically.
3. Click `START` and confirm the timer starts.
4. Refresh while active and confirm the timer resumes from the saved `startedAt`.
5. Start a new idle session, add an exercise, and complete the first set without pressing `START`; confirm the timer starts only then.
6. Search `chest` and confirm ExerciseDB results show image, exercise name, target muscle, and equipment.
7. Search Arabic examples such as `صدر`, `سكوات`, and `بنش`; confirm results are returned through the English-normalized route.
8. Add a real exercise, add two sets, edit kg/reps, delete one set, and refresh.
9. Confirm the deleted set remains deleted and the remaining set data persists.
10. Delete the exercise, refresh, and confirm it remains deleted.

### Nutrition Flow

1. Open `/dashboard/nutrition`.
2. Add a USDA food to a meal and confirm the meal totals update immediately.
3. Refresh and confirm the saved food remains for the selected date.
4. Delete the food entry and confirm calorie and macro totals update immediately.
5. Refresh and confirm the deleted food remains deleted.
6. Search `egg`; confirm the visible serving is `1 large egg (50g)` and calories are in a realistic single-egg range rather than treating USDA data as one oversized unit.
7. Search unknown foods and confirm the serving basis is clearly shown as `per 100g`.

### Profile And Analytics

1. Open `/dashboard/profile`.
2. Confirm the user card, body stats, current goal, activity level, weekly target, calorie target, macro targets, edit profile link, sign out link, privacy/security, and app settings placeholder are visible.
3. Open `/dashboard` and confirm calories/macros reflect saved nutrition entries and saved targets.
4. Open `/dashboard/analytics` and confirm charts render in fixed-height containers without Recharts width/height warnings.
5. Ignore any console noise from `chrome-extension://`, `content.js`, or `HB-PORT`; these are browser-extension issues.

## Local Setup Used

1. Start a clean local dev server:

   ```bash
   pnpm dev -- -p 3002
   ```

2. Confirm `.env.local` has valid MongoDB, Google OAuth, ExerciseDB, and USDA values.

3. For authenticated local QA where completing Google OAuth is blocked, enable the development-only bypass:

   ```env
   DEV_AUTH_BYPASS=true
   ```

   This bypass only works when `NODE_ENV=development`. The QA user id is `dev-test-user`.

4. Optional clean start for this QA user:
   - Delete `dev-test-user` documents from `workout_sessions`, `exercise_entries`, `exercise_sets`, `nutrition_logs`, and `userProfiles`.

## Google Login Flow

1. Open `http://localhost:3002/login`.
2. Click `Sign in with Google`.
3. Confirm the browser leaves the app and lands on Google's account identifier page.

Observed:

- The Google OAuth flow starts successfully.
- Full completion was not performed because it requires an external Google account login.
- The generated Google redirect URI used `http://localhost:3000/api/auth/callback/google`, which comes from `NEXTAUTH_URL`. The QA server was on port `3002`, so the dev-only bypass was used for authenticated app testing.

## Workout Flow

1. Open `http://localhost:3002/dashboard/workout`.
2. Confirm the page loads as the dev QA user and shows `New Workout`.
3. Click `Add Exercise`.
4. Search ExerciseDB for `push`.
5. Select `cable incline pushdown`.
6. Confirm the exercise appears in the workout.
7. Click `+ ADD SET` twice.
8. Enter set values:
   - Set 1: `12.5 kg`, `10 reps`
   - Set 2: `20 kg`, `8 reps`
   - Set 3: `22.5 kg`, `6 reps`
9. Mark all three sets complete.
10. Refresh `/dashboard/workout`.
11. Confirm the real ExerciseDB exercise and all three sets restore.

Observed MongoDB data:

- `workout_sessions`: active session for `dev-test-user`
- `exercise_entries`: `cable incline pushdown`, ExerciseDB id `0172`, target muscle `lats`
- `exercise_sets`:
  - Set 1: `12.5 kg x 10`, completed
  - Set 2: `20 kg x 8`, completed
  - Set 3: `22.5 kg x 6`, completed

## Nutrition Flow

1. Open `http://localhost:3002/dashboard/nutrition`.
2. Confirm the page loads and shows empty meal sections.
3. Click the Breakfast `ADD FOOD` button.
4. Search USDA FoodData Central for `apple`.
5. Select `Apple, raw`.
6. Confirm breakfast updates immediately.
7. Refresh `/dashboard/nutrition`.
8. Confirm `Apple, raw` remains saved under Breakfast and totals remain visible.

Observed MongoDB data:

- `nutrition_logs`: breakfast log for `dev-test-user`
- Saved food entry: `Apple, raw`, `100 g`, `61 kcal`, `0.2 g protein`, `14.8 g carbs`, `0.1 g fat`

## Dashboard Flow

1. Open `http://localhost:3002/dashboard`.
2. Confirm Daily Energy reflects saved nutrition.
3. Confirm Macronutrients reflect saved nutrition.
4. Confirm Recent Activity reflects the active workout.
5. Confirm workout volume reflects completed set data.

Observed:

- Daily Energy: `61` kcal logged
- Carbs: `15 g` logged
- Recent Activity: `New Workout`
- Workout volume: `420 kg`

## Verification Commands

```bash
pnpm lint
npx next build
```
