# Server Components Coding Standards

## Params Must Be Awaited

This project uses **Next.js 15**, where route params are **Promises**. You **must** `await` params before accessing any properties.

```tsx
// ✅ Correct — params is awaited
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
}

// ❌ Wrong — params is not a plain object in Next.js 15
type Props = {
  params: { workoutId: string };
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = params; // runtime error
}
```

This applies to **all** dynamic route segments, including:
- Single params: `[id]`, `[workoutId]`
- Catch-all params: `[...slug]`
- Optional catch-all params: `[[...slug]]`

## Search Params Must Also Be Awaited

`searchParams` follows the same rule — it is also a Promise in Next.js 15.

```tsx
// ✅ Correct
type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { page } = await searchParams;
}
```

## Auth and Redirects

Always check authentication at the top of a server component before fetching data. Use `redirect()` for unauthenticated users.

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  // ...
}
```

## Not Found

Use `notFound()` from `next/navigation` when a resource does not exist or does not belong to the authenticated user.

```tsx
import { notFound } from "next/navigation";

const workout = await getWorkoutById(workoutId, userId);
if (!workout) notFound();
```

## Data Fetching

All data fetching must go through `/data` helpers. See [data-fetching.md](./data-fetching.md) for full rules.
