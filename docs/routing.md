# Routing Standards

## Route Structure

All application routes must be nested under `/dashboard`:

- `/dashboard` — main dashboard page
- `/dashboard/<feature>` — feature pages (e.g., `/dashboard/workouts`)
- `/dashboard/<feature>/[id]` — dynamic detail pages

There are no top-level app routes other than public pages (e.g., `/login`, `/signup`).

## Route Protection

All `/dashboard` routes are protected and require the user to be authenticated.

Route protection is handled exclusively via **Next.js middleware** (`src/middleware.ts`). Do not implement auth guards inside page components or layouts.

```ts
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = // check session/cookie here

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

## File Placement

- Dashboard pages go in `src/app/dashboard/<feature>/page.tsx`
- Nested layouts (if needed) go in `src/app/dashboard/<feature>/layout.tsx`
- The root dashboard page is at `src/app/dashboard/page.tsx`
