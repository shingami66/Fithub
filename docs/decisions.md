# Project Pulse — Architecture Decision Records

## ADR-001: Next.js 14 App Router

**Decision**: Use Next.js 14 with App Router instead of Pages Router.

**Rationale**:

- Server Components reduce client-side JavaScript bundle
- Server Actions simplify data mutations without separate API routes
- Nested layouts enable shared UI across route groups
- Streaming and Suspense improve perceived performance

---

## ADR-002: Tailwind CSS (No CSS Modules)

**Decision**: Use Tailwind CSS exclusively. No CSS modules or standalone CSS files.

**Rationale**:

- Consistent design system via configuration
- No runtime CSS overhead
- Co-located styles in component files (no context switching)
- Purged unused CSS in production builds

---

## ADR-003: MongoDB Atlas

**Decision**: Use MongoDB Atlas as the primary database.

**Rationale**:

- Flexible schema suits evolving workout/nutrition data models
- Excellent scaling characteristics for SaaS workloads
- Native JSON/BSON aligns with TypeScript data flow
- Atlas provides managed backups, monitoring, and global clusters

---

## ADR-004: Server Components by Default

**Decision**: Prefer Server Components; use Client Components only when necessary.

**Rationale**:

- Reduces client-side JavaScript bundle size
- Direct database/service access without API round-trips
- Better SEO and initial page load performance
- Aligns with Next.js 14 recommended patterns

---

## ADR-005: pnpm Package Manager

**Decision**: Use pnpm instead of npm or yarn.

**Rationale**:

- Strict dependency resolution prevents phantom dependencies
- Content-addressable storage saves disk space
- Faster installation times via hard links
- Better monorepo support for future scaling

---

## ADR-006: clsx + tailwind-merge for Class Management

**Decision**: Use clsx for conditional classes and tailwind-merge for conflict resolution.

**Rationale**:

- clsx handles conditional/dynamic class composition cleanly
- tailwind-merge resolves Tailwind class conflicts (e.g., `px-4` vs `px-2`)
- Combined via `cn()` utility, they provide a single, type-safe API for all class management
