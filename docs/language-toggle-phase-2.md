# Language Toggle — Phase 2 Notes

## Component-Level RTL Polish

- Nutrition cards (inline quantity expander, edit card, delete state) may need layout fixes under `rtl` direction (e.g., margins, flex-row-reverse or explicit row directions).
- Workout exercise cards (sets, reps, weight) currently maintain English LTR layout. Needs deep refactoring to support bidirectional or full RTL layouts gracefully.
- Do not blindly flip `margin-right` to `margin-left`. Use logical properties (`ms-`, `me-`, `ps-`, `pe-`) throughout Tailwind codebase.

## Broader Static Label Coverage

- Translate remaining labels: "Welcome", "Search foods", "History", "No entries found", etc.
- Replace manual translations with a formal tool if scale grows.

## Route-Based Locales

- Consider adopting `next-intl` or Next.js App Router i18n routing (`/[locale]/dashboard/...`) if we need to support URL-based locales for SEO or sharing.

## Database & User Preference

- Save selected language to user's database profile so it persists across devices. Currently, it relies on `localStorage`.

## Toasts & Validations

- Translate server-side Zod validation errors and client-side toast notifications.
