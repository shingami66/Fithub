# Project Pulse — Database Schema

## Overview

MongoDB Atlas with the native `mongodb` driver. Collections use a document-oriented design optimized for the read-heavy dashboard patterns of a fitness tracker.

---

## Collections

### `users`

Stores user accounts, authentication references, and personal preferences.

```typescript
{
  _id: ObjectId;

  // Identity
  name: string;
  email: string;                            // unique index
  image?: string;                           // avatar URL from OAuth

  // Auth
  provider: 'google' | 'credentials';
  emailVerified?: Date;

  // Preferences
  preferences: {
    theme: 'dark' | 'light';               // default: 'dark'
    units: 'metric' | 'imperial';           // default: 'metric'
    goals: {
      dailyCalories: number;                // e.g. 2200
      proteinGrams: number;                 // e.g. 150
      carbsGrams: number;                   // e.g. 250
      fatGrams: number;                     // e.g. 70
    };
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
| Field | Type | Purpose |
|-------|------|---------|
| `email` | Unique | Fast lookup, prevent duplicates |

---

### `workouts`

Top-level workout sessions. Each workout contains an ordered list of exercises, but individual sets are stored in a separate collection for granular tracking and analytics.

```typescript
{
  _id: ObjectId;
  userId: ObjectId;                          // ref → users

  // Metadata
  name: string;                              // "Push Day", "Morning Run"
  type: 'strength' | 'cardio' | 'flexibility' | 'custom';
  status: 'in_progress' | 'completed' | 'cancelled';

  // Exercises (embedded — lightweight reference list)
  exercises: Array<{
    exerciseId: string;                      // stable client-generated ID
    name: string;                            // "Bench Press"
    muscleGroup?: string;                    // "chest", "legs", etc.
    order: number;                           // display sequence
  }>;

  // Aggregated stats (computed on completion)
  duration?: number;                         // total minutes
  totalVolume?: number;                      // sum of (weight × reps) across all sets
  caloriesBurned?: number;
  notes?: string;

  // Timestamps
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
| Fields | Type | Purpose |
|--------|------|---------|
| `userId, createdAt` | Compound | User workout history (sorted) |
| `userId, status` | Compound | Quick filter for in-progress workouts |

---

### `workoutSets`

Individual sets within an exercise. Separated from `workouts` for:

- Granular analytics (PR tracking, volume trends per exercise)
- Efficient pagination (workouts can have 50+ sets)
- Independent updates during live logging (no full-document rewrites)

```typescript
{
  _id: ObjectId;
  workoutId: ObjectId;                       // ref → workouts
  userId: ObjectId;                          // denormalized for direct queries
  exerciseId: string;                        // matches exercises[].exerciseId in workout

  // Set data (varies by workout type)
  setNumber: number;                         // 1-based order within the exercise
  reps?: number;                             // strength sets
  weight?: number;                           // kg or lbs (per user preference)
  duration?: number;                         // seconds (cardio / timed sets)
  distance?: number;                         // meters (cardio)
  rpe?: number;                              // Rate of Perceived Exertion (1-10)

  // Flags
  isWarmup: boolean;                         // default: false
  isDropSet: boolean;                        // default: false
  isPR: boolean;                             // personal record flag

  // Timestamps
  completedAt: Date;
  createdAt: Date;
}
```

**Indexes:**
| Fields | Type | Purpose |
|--------|------|---------|
| `workoutId, exerciseId, setNumber` | Compound | Ordered sets per exercise |
| `userId, exerciseId, completedAt` | Compound | Exercise history & PR detection |
| `userId, completedAt` | Compound | Global set timeline for analytics |

---

### `nutritionLogs`

Daily nutrition entries. One document per user per day — entries are pushed into an embedded array. Totals are recomputed on every write for instant dashboard reads.

```typescript
{
  _id: ObjectId;
  userId: ObjectId; // ref → users
  date: string; // ISO date "2025-05-20" (unique per user)

  // Food entries
  entries: Array<{
    entryId: string; // client-generated UUID
    food: string; // "Grilled Chicken Breast"
    brand?: string; // "Tyson"
    servingSize?: string; // "100g", "1 cup"
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber?: number; // grams
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    loggedAt: Date; // exact time of entry
  }>;

  // Pre-computed daily totals (updated on every entry mutation)
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    entryCount: number;
  }

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
| Fields | Type | Purpose |
|--------|------|---------|
| `userId, date` | Compound, Unique | One doc per user per day, fast daily lookup |
| `userId, createdAt` | Compound | Paginated history |

---

## Design Decisions

### Why separate `workoutSets` from `workouts`?

Embedding all sets inside a workout document seems simpler, but causes problems at scale:

1. **Live logging**: During a workout, each set update would rewrite the entire workout document. With a separate collection, each set is an independent insert.
2. **Analytics**: Querying "all bench press sets this month" is a simple `find()` on `workoutSets` with an index. With embedded sets, it requires `$unwind` aggregation across all workouts.
3. **Document size**: A power user logging 10 exercises × 5 sets × 365 days/year would create very large embedded arrays.

### Why embed `entries` inside `nutritionLogs`?

Unlike workout sets, nutrition entries are:

- Accessed together (always show the full day)
- Small in count (typically 5-15 entries per day)
- Rarely queried individually across days

Embedding avoids a separate collection join and keeps daily reads as a single document fetch.

### Why store `totals` as a pre-computed field?

Dashboard reads are far more frequent than writes. Pre-computing totals on every entry mutation means the dashboard can display daily macros with a single indexed read — no aggregation pipeline needed.
