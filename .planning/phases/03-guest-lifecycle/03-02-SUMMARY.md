---
phase: 03-guest-lifecycle
plan: 02
subsystem: ui
tags: [settlement, checkout, dialog, charges, server-actions, drizzle]

requires:
  - phase: 03-guest-lifecycle
    provides: dispatch board with guest cards, dock strip, amenity logging, charges table

provides:
  - Settlement modal with itemized charges grouped by category
  - settleAccount server action (checked_out status, slip release)
  - getSettlementData query with charges and computed totals
  - Complete departure workflow from board

affects: [manager-reporting]

tech-stack:
  added: []
  patterns: [dialog-confirmation-step, charge-grouping-by-category]

key-files:
  created:
    - src/components/board/settlement-modal.tsx
  modified:
    - src/app/board/actions.ts
    - src/lib/queries.ts
    - src/components/board/dispatch-board.tsx

key-decisions:
  - "Settlement total computed from charges table SUM, not recalculated from nightly rate"
  - "Added charges relation to fetchActiveStays so settlement modal can access charges without separate fetch"
  - "Confirmation step uses inline state toggle within the same dialog, not a nested dialog"

patterns-established:
  - "Dialog confirmation: boolean state toggles between action button and confirm/cancel pair"
  - "Charge grouping: Map by category, sorted by predefined order (slip, fuel, amenity)"

requirements-completed: [SETL-01, SETL-02, SETL-03, SETL-04, SETL-05]

duration: 3min
completed: 2026-03-28
---

# Phase 3 Plan 2: Settlement & Checkout Summary

**Settlement modal with itemized charges grouped by category, confirmation step, and checkout that releases slip to available**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T02:58:42Z
- **Completed:** 2026-03-28T03:01:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Settlement modal opens from Settle button on departing guest cards with itemized charges
- Charges grouped by category (slip, fuel, amenity) with subtotals and grand total
- Complete Checkout with confirmation step marks stay checked_out, sets checkOut date, releases slip
- Board auto-refreshes after settlement (card disappears, dock strip slot turns available)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add settleAccount server action and getSettlementData query** - `45eadf2` (feat)
2. **Task 2: Build settlement modal and wire to dispatch board** - `a11727e` (feat)

## Files Created/Modified
- `src/components/board/settlement-modal.tsx` - Dialog with grouped charges table, totals, confirmation flow
- `src/app/board/actions.ts` - Added settleAccount server action
- `src/lib/queries.ts` - Added getSettlementData query, added charges to fetchActiveStays
- `src/components/board/dispatch-board.tsx` - Wired settleStayId state and SettlementModal

## Decisions Made
- Settlement total computed from charges table SUM (not recalculated) per plan spec
- Added charges relation to fetchActiveStays board query so modal can read charges from existing stay data without a separate fetch
- Confirmation uses inline boolean state toggle (confirming) within the same dialog rather than a nested dialog

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added charges to fetchActiveStays query**
- **Found during:** Task 2 (Settlement modal integration)
- **Issue:** Board query (fetchActiveStays) did not include charges relation, but settlement modal needs charge data from the stays array
- **Fix:** Added `charges: { orderBy: (ch, { asc }) => [asc(ch.createdAt)] }` to the with clause
- **Files modified:** src/lib/queries.ts
- **Committed in:** a11727e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for settlement modal to access charges. No scope creep.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Full guest lifecycle complete: check-in, amenity logging, detail view, settlement/checkout
- Manager dashboard (Phase 04) can query checked_out stays for reporting

---
*Phase: 03-guest-lifecycle*
*Completed: 2026-03-28*
