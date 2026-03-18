# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** (App Router) with TypeScript
- **React 19**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)

## Architecture

This is a fresh Next.js App Router project. Source lives under `src/app/`:
- `layout.tsx` — root layout
- `page.tsx` — home page
- `globals.css` — global styles with Tailwind imports

New routes go in `src/app/<route>/page.tsx`. Shared components should be placed in `src/components/` (not yet created).
