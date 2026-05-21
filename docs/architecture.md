# Project Pulse — Architecture Overview

## Philosophy

Project Pulse follows a **feature-first, server-centric** architecture built on Next.js 14 App Router. The goal is minimal client-side JavaScript, maximum server-side rendering, and clean separation of concerns.

## Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Framework | Next.js 14 (App Router)  |
| Language  | TypeScript (Strict Mode) |
| Styling   | Tailwind CSS             |
| Database  | MongoDB Atlas            |
| Auth      | NextAuth.js (planned)    |
| Animation | Framer Motion            |
| Icons     | Lucide React             |

## Rendering Strategy

- **Server Components** are the default for all pages and layouts
- **Client Components** are used only when interactivity is required (forms, animations, state)
- **Server Actions** handle all mutations (form submissions, data writes)
- **Route Handlers** (`app/api/`) serve external API consumers

## Folder Structure Philosophy

```
app/           → Routes, layouts, pages (Next.js App Router)
components/    → Reusable UI components (ui/) and layout shells (layout/)
config/        → Static configuration (site metadata, navigation, dashboard config)
lib/           → Core business logic, utilities, services, database, auth
types/         → Shared TypeScript type definitions
docs/          → Project documentation
```

### Why Feature-First?

Instead of grouping by file type (all controllers together, all models together), we group by domain concern:

- `lib/db/` — Database connection, models, queries
- `lib/auth/` — Authentication logic and configuration
- `lib/services/` — Business logic services (workout, nutrition, analytics)
- `lib/validations/` — Zod schemas and validation logic
- `lib/utils/` — Pure utility functions (cn, formatting, etc.)

## Route Groups

- `(dashboard)/` — Protected dashboard routes (workout log, nutrition, analytics)
- `(auth)/` — Authentication routes (login, register, forgot password)
- `api/` — REST API endpoints

## Key Principles

1. **Minimize client-side state** — Use server components and URL state where possible
2. **Type everything** — No `any` types, strict TypeScript throughout
3. **Absolute imports only** — All imports use `@/*` alias
4. **Composition over inheritance** — Small, composable components
5. **Progressive enhancement** — Core functionality works without JavaScript
