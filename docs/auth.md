# Auth Coding Standards

## Provider

This app uses **[Clerk](https://clerk.com/)** for all authentication. Do not implement custom auth or use any other auth library.

## Installation

Clerk is installed via the Next.js SDK:

```bash
npm install @clerk/nextjs
```

## Setup

The `ClerkProvider` must wrap the app in the root layout (`src/app/layout.tsx`):

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Protecting Routes

Use Clerk's `middleware.ts` to protect routes. Place it at `src/middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

## Accessing the Current User

### Server Components / Route Handlers

Use `auth()` or `currentUser()` from `@clerk/nextjs/server`:

```ts
import { auth, currentUser } from "@clerk/nextjs/server";

// Get user ID only (lightweight)
const { userId } = await auth();

// Get full user object
const user = await currentUser();
```

### Client Components

Use the `useUser` or `useAuth` hooks:

```tsx
"use client";
import { useUser, useAuth } from "@clerk/nextjs";

const { user } = useUser();
const { userId, isSignedIn } = useAuth();
```

## Sign In / Sign Up UI

Use Clerk's pre-built components. Do not build custom auth forms:

```tsx
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";

// Sign-in page: src/app/sign-in/[[...sign-in]]/page.tsx
export default function SignInPage() {
  return <SignIn />;
}

// Sign-up page: src/app/sign-up/[[...sign-up]]/page.tsx
export default function SignUpPage() {
  return <SignUp />;
}

// User menu (shows avatar + sign-out)
<UserButton />
```

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Optional redirect configuration:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```
