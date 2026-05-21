# Project Pulse — API Design

## Overview

Project Pulse uses a hybrid approach:

- **Server Actions** for internal mutations (preferred)
- **Route Handlers** (`app/api/`) for external-facing REST endpoints

## API Conventions

### Route Handlers

- Located in `app/api/`
- Follow RESTful naming conventions
- Return consistent JSON response shapes
- Use proper HTTP status codes

### Response Shape

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### Status Codes

| Code | Usage                     |
| ---- | ------------------------- |
| 200  | Successful GET/PUT/PATCH  |
| 201  | Successful POST (created) |
| 204  | Successful DELETE         |
| 400  | Validation error          |
| 401  | Unauthenticated           |
| 403  | Unauthorized              |
| 404  | Resource not found        |
| 500  | Internal server error     |

## Planned Endpoints

### Workouts

- `GET /api/workouts` — List user workouts
- `POST /api/workouts` — Create workout
- `GET /api/workouts/:id` — Get workout details
- `PATCH /api/workouts/:id` — Update workout
- `DELETE /api/workouts/:id` — Delete workout

### Nutrition

- `GET /api/nutrition/log` — Get daily nutrition log
- `POST /api/nutrition/log` — Add food entry
- `GET /api/nutrition/search` — Search food database

### Analytics

- `GET /api/analytics/overview` — Dashboard summary
- `GET /api/analytics/trends` — Trend data over time

## Authentication

All API routes (except auth endpoints) require authentication via NextAuth.js session tokens.
