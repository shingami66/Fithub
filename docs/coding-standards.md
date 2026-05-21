# Project Pulse — Coding Standards

## TypeScript

- **Strict mode** is enabled — no implicit `any`, strict null checks
- **Never use `any`** — use `unknown` and narrow, or define proper types
- All shared types live in `types/`
- Use `interface` for object shapes, `type` for unions/intersections
- Export types from barrel files where appropriate

## Components

### Naming

- PascalCase for component files and names: `WorkoutCard.tsx`
- camelCase for utilities and hooks: `useWorkout.ts`, `formatDate.ts`
- kebab-case for route segments: `app/(dashboard)/workout-log/`

### Structure

```typescript
// 1. Imports (external → internal → types)
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { Workout } from '@/types';

// 2. Types/Interfaces
interface WorkoutCardProps {
  workout: Workout;
  className?: string;
}

// 3. Component
export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  return (
    <div className={cn('rounded-xl bg-zinc-900 p-4', className)}>
      {/* ... */}
    </div>
  );
}
```

### Server vs Client

- Default to Server Components
- Add `'use client'` only when using: hooks, event handlers, browser APIs, framer-motion
- Keep client components small and leaf-level

## Imports

- **Absolute imports only**: `@/lib/utils/cn` not `../../lib/utils/cn`
- Order: external packages → internal modules → types
- Use named exports (avoid default exports except for pages)

## Styling

- Tailwind CSS classes only
- Use `cn()` for conditional/composed classes
- Define design tokens in `tailwind.config.ts`
- No inline styles, CSS modules, or standalone CSS files

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Husky pre-commit hook runs ESLint + Prettier on staged files
- All PRs must pass lint and type checks

## File Organization

- One component per file
- Co-locate tests with source files (`.test.ts` suffix)
- Keep files under 200 lines when possible
- Extract reusable logic into `lib/` utilities or custom hooks
