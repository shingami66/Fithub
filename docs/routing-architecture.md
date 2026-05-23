# Routing Architecture

## Overview

Project Pulse follows a strict, canonical Next.js App Router architecture. We use explicit folder nesting instead of Route Groups to ensure predictable URLs and prevent routing conflicts.

## The Strategy

- **Public Routes:** Reside at the root of the `app/` directory (e.g., `app/page.tsx` for the landing page).
- **Authentication Routes:** Reside under the `(auth)` route group (e.g., `app/(auth)/login/page.tsx` -> `/login`) as these are isolated and don't conflict with dashboard nesting.
- **Protected Dashboard Routes:** Reside explicitly under the `app/dashboard/` directory.

### Why Route Groups Were Removed for the Dashboard

Previously, the dashboard used a `(dashboard)` Route Group. In Next.js, Route Groups are ignored in the URL path. This caused severe conflicts:

1. `app/(dashboard)/workout/page.tsx` mapped to `/workout`, not `/dashboard/workout`.
2. `app/(dashboard)/page.tsx` mapped to `/`, which conflicted with the public landing page at `app/page.tsx`, causing build failures.

By restructuring to a hard `dashboard` folder, all routes naturally inherit the `/dashboard/...` URL prefix.

## Layout Inheritance

- **Root Layout (`app/layout.tsx`):** Provides global providers (NextAuth, Toast) and basic HTML/body structures.
- **Dashboard Layout (`app/dashboard/layout.tsx`):** Centralizes the authenticated app shell. It provides the `BottomNav`, global atmospheric lighting, safe-area spacing, and max-width constraints. This layout applies to _every_ page under `/dashboard/*`.

## Authentication Protection

Authentication is enforced at the Edge via `middleware.ts`.

- **Matcher:** The middleware is configured to only run on `matcher: ['/dashboard/:path*']`.
- **Benefit:** Public pages (`/`, `/login`) bypass middleware entirely, ensuring maximum performance. Any request to a `/dashboard/*` route without a valid NextAuth session is intercepted instantly and redirected to `/login`.
