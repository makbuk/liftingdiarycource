# UI Coding Standards

## Component Library

**Only shadcn/ui components** must be used for all UI in this project. No custom components are to be created.

- Install components via the shadcn CLI: `npx shadcn@latest add <component>`
- All installed components live in `src/components/ui/`
- Use these components directly — do not wrap, extend, or create custom alternatives

If a UI need cannot be met by an existing shadcn/ui component, install the appropriate one from the shadcn/ui library first.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be formatted using ordinal day, abbreviated month, and full year:

| Date | Formatted Output |
|------|-----------------|
| 2025-09-01 | 1st Sep 2025 |
| 2025-08-02 | 2nd Aug 2025 |
| 2026-01-03 | 3rd Jan 2026 |
| 2024-06-04 | 4th Jun 2024 |

### Implementation

Use `format` with the `do MMM yyyy` format string:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```
