---
phase: 03-guest-lifecycle
plan: 01
subsystem: ui
tags: [shadcn, sheet, popover, amenity-logging, server-actions, drizzle]

requires:
  - phase: 02-dispatch-board-check-in
    provides: dispatch board with guest cards, dock strip, board queries

provides:
  - Guest detail slide-over panel (Sheet) with stay info, credentials, amenity log
  - Amenity logger component with single-tap and popover form patterns
  - logAmenity server action handling 5 amenity types with pricing lookup
  - getStayDetail query with full stay relations
  - formatDate helper

affects: [03-02-settlement, 03-03-guest-portal]

tech-stack:
  added: [shadcn-sheet, shadcn-popover]
  patterns: [discriminated-union-server-actions, single-tap-amenity-logging, sheet-slide-over-state]

key-files:
  created:
    - src/components/board/guest-detail-panel.tsx
    - src/components/board/amenity-logger.tsx
    - src/components/ui/sheet.tsx
    - src/components/ui/popover.tsx
  modified:
    - src/app/board/actions.ts
    - src/lib/queries.ts
    - src/lib/format.ts
    - src/components/board/dispatch-board.tsx
    - src/components/board/guest-card.tsx

key-decisions:
  - "Departing card click opens detail panel, Settle button stays separate for settlement flow"
  - "Shore power uses $0.12/kWh flat rate per CONTEXT.md, not per-day pricing from pricing table"
  - "Shower tokens: free usage creates $0 amenityUsage record (no charge row), paid creates both"

patterns-established:
  - "Sheet slide-over state: detailStayId state in parent, Sheet open derived from null check"
  - "Amenity logging: discriminated union input type for server action, pricing lookup at action start"
  - "Popover forms: controlled open state for fuel/power inputs, close on successful submit"

requirements-completed: [AMEN-01, AMEN-02, AMEN-03, AMEN-04, AMEN-05, AMEN-06, AMEN-07]

duration: 6min
completed: 2026-03-28
---

# Phase 3 Plan 1: Guest Detail & Amenity Logging Summary

**Right-side slide-over panel with stay credentials, amenity log, and single-tap/popover amenity logger for all 5 types**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-28T02:49:55Z
- **Completed:** 2026-03-28T02:56:23Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Guest detail slide-over opens from checked-in cards, departing cards, and occupied dock strip slots
- Amenity logger supports all 5 types: shower (token-aware), fuel (popover with gallons + type), shore power (popover with kWh), pump-out, laundry
- logAmenity server action with pricing table lookup and shower token tracking
- getStayDetail query with ordered amenityUsages and charges relations

## Task Commits

Each task was committed atomically:

1. **Task 1: Install shadcn, queries, server action, format helpers** - `ecfb60c` (feat)
2. **Task 2: Build guest detail panel, amenity logger, wire dispatch board** - `239e2d9` (feat)

## Files Created/Modified
- `src/components/ui/sheet.tsx` - shadcn Sheet (right slide-over)
- `src/components/ui/popover.tsx` - shadcn Popover (fuel/power input forms)
- `src/components/board/guest-detail-panel.tsx` - Slide-over with stay info, credentials, amenity log, logger
- `src/components/board/amenity-logger.tsx` - 5 icon buttons with single-tap and popover patterns
- `src/app/board/actions.ts` - Added logAmenity server action (5 amenity types)
- `src/lib/queries.ts` - Added getStayDetail query
- `src/lib/format.ts` - Added formatDate helper
- `src/components/board/dispatch-board.tsx` - Wired detailStayId state, GuestDetailPanel, dock strip click
- `src/components/board/guest-card.tsx` - Departing card click opens detail, Settle button separate

## Decisions Made
- Departing card body click opens detail panel (onViewStay), while the explicit "Settle" button calls onSettle -- gives staff access to detail before settling
- Shore power priced at $0.12/kWh (12 cents) per CONTEXT.md locked decision, not the per-day rate from pricing table
- Free shower usage creates amenityUsage record with totalAmount=0 but no charge row (tracks usage without billing)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- npx shadcn@latest not working due to local npm config; resolved by using local binary ./node_modules/.bin/shadcn directly
- .next cache corruption required rm -rf .next for clean build

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Guest detail panel and amenity logging complete
- Settlement panel (Plan 02) can wire into existing handleSettle callback
- Guest portal (Plan 03) can reuse getStayDetail query pattern

---
*Phase: 03-guest-lifecycle*
*Completed: 2026-03-28*
