# Data Mutations Coding Standards

## Overview

All data mutations follow a two-layer pattern:

1. **`/data` helpers** — Drizzle ORM calls, no business logic
2. **Server actions** — validate input, enforce auth, call `/data` helpers

## Layer 1: `/data` Helpers

All database writes **must** go through helper functions in `src/data/`. Do not write Drizzle calls directly in server actions or components.

```
src/
  data/
    workouts.ts   # e.g. createWorkout(), deleteWorkout()
    exercises.ts  # e.g. createExercise(), updateExercise()
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();
  return workout;
}

export async function deleteWorkout(id: string, userId: string) {
  await db
    .delete(workouts)
    .where(eq(workouts.id, id) && eq(workouts.userId, userId));
}
```

**Rules:**
- **Always** use [Drizzle ORM](https://orm.drizzle.team/) — no raw SQL
- **Always** scope writes to the authenticated user's ID (same authorization rules as data fetching)
- Do not call `auth()` inside `/data` helpers — receive `userId` as a parameter

## Layer 2: Server Actions

All mutations exposed to the UI **must** be implemented as [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations).

### File placement

Server actions **must** live in a colocated `actions.ts` file next to the route that uses them:

```
src/app/
  dashboard/
    page.tsx
    actions.ts      ✅ colocated
  workouts/
    [id]/
      page.tsx
      actions.ts    ✅ colocated
```

Do not place server actions in a global file unless they are genuinely shared across multiple routes.

### Typed parameters — no FormData

Server action parameters **must** be typed. **Never** use `FormData` as a parameter type.

```ts
// ✅ Correct — typed params
export async function createWorkoutAction(name: string, date: Date) { ... }

// ❌ Wrong — FormData is not allowed
export async function createWorkoutAction(formData: FormData) { ... }
```

Pass structured data from the client using `.bind()` or by calling the action directly with typed arguments.

### Zod validation

**Every** server action **must** validate its arguments with [Zod](https://zod.dev/) before doing anything else.

```ts
import { z } from "zod";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.date(),
});
```

### Full example

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.safeParse({ name, date });
  if (!parsed.success) throw new Error("Invalid input");

  return createWorkout(userId, parsed.data.name, parsed.data.date);
}
```

### Redirects

**Never** call `redirect()` inside a server action. Server actions must return data (or throw); navigation is the client's responsibility.

After a server action resolves, perform the redirect client-side using the Next.js router:

```ts
// ✅ Correct — redirect on the client after the action resolves
"use client";
import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";

const router = useRouter();

async function handleSubmit() {
  await createWorkoutAction(name, date);
  router.push("/dashboard"); // redirect happens client-side
}

// ❌ Wrong — do not redirect inside a server action
export async function createWorkoutAction(name: string, date: Date) {
  // ...
  redirect("/dashboard"); // not allowed
}
```

### Rules summary

| Rule | Detail |
|------|--------|
| `"use server"` directive | Must be at the top of every `actions.ts` file |
| Colocated file | `actions.ts` sits next to the `page.tsx` that uses it |
| Typed params | All parameters must have explicit TypeScript types |
| No `FormData` | Never accept `FormData` as a parameter |
| Zod validation | Every action validates all inputs before processing |
| Auth check | Always verify the user is authenticated before mutating data |
| `/data` helpers | Never call Drizzle directly in an action — delegate to `/data` |
| No `redirect()` | Never call `redirect()` in a server action — redirect client-side after the action resolves |
