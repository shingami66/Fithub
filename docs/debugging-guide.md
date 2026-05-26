# Debugging Guide

## Clean Browser Testing

Use an Incognito or private browser window when checking app regressions. Sign in normally, or enable the local development auth bypass only for local QA.

Disable extensions before treating console output as an app defect. Translation tools, AI browser helpers, password managers, and React/Next.js dev overlay helpers can all inject DOM attributes or background scripts.

## Extension Noise

These messages are classified as browser or extension noise unless they are paired with a real app stack trace or broken UI:

- `chrome-extension://...` errors
- `A listener indicated asynchronous response...`
- `data-immersive-translate-page-theme`
- Chrome Built-In AI `LanguageDetector`
- Next.js original stack frame `400` when it is emitted by the dev overlay while mapping an unrelated extension frame

## Real App Errors

Treat these as app issues:

- A page shows the Next.js error boundary or `Application error`
- A server action returns a failed toast for a normal user flow
- API routes return 5xx responses from app-owned code
- The server log contains a Project Pulse fingerprint such as `DB_CONNECT_TIMEOUT`, `USDA_API_UNAVAILABLE`, or `ACTION_VALIDATION_FAILED`

## Hydration Notes

The root `<html>` element uses `suppressHydrationWarning` because some browser extensions mutate top-level attributes before React hydrates. This is intentionally limited to the root element and is not a substitute for fixing app-owned hydration mismatches.
