---
phase: 03-guest-lifecycle
plan: 03
subsystem: guest-portal
tags: [guest, portal, mobile, credentials, charges]
dependency_graph:
  requires: [01-01, 01-02, 01-03]
  provides: [guest-portal-page, getGuestPortalData-query, format-utilities]
  affects: [guest-experience]
tech_stack:
  added: [date-fns]
  patterns: [RSC-data-fetching, userId-to-guest-email-lookup, drizzle-relational-queries]
key_files:
  created:
    - src/lib/format.ts
  modified:
    - src/lib/queries.ts
    - src/app/guest/page.tsx
decisions:
  - Created format.ts with formatCurrency and formatDate since it did not exist yet (parallel plan)
  - Used userId -> user email -> guest email lookup chain for guest portal data
metrics:
  duration: 3min
  completed: "2026-03-28T02:53:36Z"
---

# Phase 3 Plan 3: Guest Portal Summary

Guest portal page with stay card, credentials in JetBrains Mono, and itemized charges for transient boaters.

## What Was Built

### getGuestPortalData Query (src/lib/queries.ts)
- Maps session userId to user record (get email), then finds matching guest by email, then fetches active stay with slip, amenityUsages, and charges via Drizzle relational query
- Returns null if no user, no guest match, or no active stay found

### Format Utilities (src/lib/format.ts)
- `formatCurrency(cents)` -- converts integer cents to "$XX.XX" display format
- `formatDate(date)` -- formats Date or string to "Mar 28, 2026" display format

### Guest Portal Page (src/app/guest/page.tsx)
- Server Component (RSC) -- all data fetched server-side, zero client JS
- Single-column layout (max-w-lg) optimized for mobile
- guest-welcome.png banner image at top with rounded corners
- Stay card showing slip name in large ocean-blue text, size badge, check-in/departure dates, nights remaining
- Credentials card with bg-navy/5 background: gate code (font-mono text-2xl bold), Wi-Fi password (font-mono text-xl), shower tokens remaining (font-mono text-lg)
- Charges card with itemized list and separator before total
- "No active stay" fallback with friendly message and guest icon
- All monetary values divided by 100 for display via formatCurrency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created src/lib/format.ts**
- **Found during:** Task 1
- **Issue:** format.ts did not exist yet (Plan 01 runs in parallel)
- **Fix:** Created with formatCurrency helper; linter expanded it with formatDate
- **Files created:** src/lib/format.ts
- **Commit:** a69e1d9

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | a69e1d9 | feat(03-03): add getGuestPortalData query and format utilities |
| 2 | ff6f1cd | feat(03-03): build full guest portal page replacing placeholder |

## Verification

- Build passes with 0 errors (Next.js webpack build)
- Guest portal is a server component with no "use client" directive
- All UI components (Card, Badge, Separator) from shadcn/ui
- Credentials use font-mono class (JetBrains Mono)
- guest-welcome.png referenced as banner image
