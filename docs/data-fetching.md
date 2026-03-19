# Data Fetching

## CRITICAL: Server Components Only

ALL data fetching in this app **must** be done exclusively via **React Server Components**.

**NEVER** fetch data via:
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side fetching library
- Any other mechanism

If you need data in a client component, fetch it in a server component parent and pass it down as props.

## Database Access via `/data` Helpers

All database queries **must** go through helper functions in the `/data` directory.

- **DO NOT** write raw SQL anywhere
- **DO NOT** query the database directly from components
- **ALWAYS** use [Drizzle ORM](https://orm.drizzle.team/) inside `/data` helper functions

### Example structure

```
src/
  data/
    workouts.ts   # e.g. getWorkoutsForUser(userId)
    exercises.ts  # e.g. getExercisesForUser(userId)
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example server component

```tsx
// src/app/dashboard/page.tsx
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);
  return <WorkoutList workouts={workouts} />;
}
```

## Authorization: Users May Only Access Their Own Data

This is **non-negotiable**. Every `/data` helper that queries user-owned data **must** filter by the authenticated user's ID.

**Rules:**
1. Always obtain the user ID from the server-side session (e.g. `auth()`), never from a URL param or request body alone.
2. Every query on user-owned tables **must** include a `WHERE userId = <authenticated user id>` condition via Drizzle's `eq(table.userId, userId)`.
3. Never expose a helper that returns data for an arbitrary user ID without first verifying the caller is that user.
4. Never trust a user-supplied ID as the sole authorization check — always cross-reference against the authenticated session.

Failing to enforce this would allow any logged-in user to read or modify another user's data.
