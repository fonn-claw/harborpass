# Phase 3: Guest Lifecycle - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the guest detail slide-over panel with amenity logging, the settlement/checkout panel for departing guests, and the guest portal. After this phase, staff can track all amenity usage during a stay, settle accounts on departure, and guests can view their own stay info through a mobile-friendly portal.

</domain>

<decisions>
## Implementation Decisions

### Guest Detail Slide-Over
- Opens from "View Stay" button on checked-in cards OR clicking occupied dock strip slot
- Right-side slide-over panel (not modal) — 400px wide on desktop, full-width on mobile
- Content sections (top to bottom):
  - Header: guest name, vessel name, slip number with colored badge
  - Stay info: check-in date, expected departure, nights remaining
  - Credentials: gate code, Wi-Fi password, shower tokens (used/remaining) in JetBrains Mono
  - Amenity log: chronological list of all usage records with timestamp, type icon, quantity, amount
  - Quick-action buttons for logging new amenity usage (see below)
- Close button (X) in top-right corner
- Background board remains visible but dimmed

### Amenity Logging Quick Actions
- Row of icon buttons at bottom of slide-over: shower, fuel, power, pump-out, laundry
- Single-tap for simple amenities: shower (deducts token, creates usage record + charge)
- Shower: if tokens remaining, uses included token (no charge). If tokens depleted, creates $3 charge.
- Pump-out: single tap, creates $15 charge
- Laundry: single tap, creates $5 charge
- Shore power: prompts for kWh amount (small number input), creates charge at $0.12/kWh
- Fuel: prompts for gallons + type (diesel/gas) via small popover form, creates charge at rate from pricing table
- Each log updates the amenity list and guest card badges instantly via revalidatePath
- Toast confirmation after each log: "Shower logged" / "12.5 gal diesel logged"

### Settlement Panel
- Opens from "Settle" button on departing guest cards
- Modal dialog (not slide-over) — wider to accommodate the charge table
- Header: guest name, vessel, slip, stay duration
- Itemized charges table:
  - Nightly slip rate × nights (auto-calculated from check-in to today)
  - Individual amenity charges grouped by type with subtotals
  - Running total at bottom in large font-heading text
- "Complete Checkout" button — marks stay as checked_out, releases slip (status → available), removes guest from board
- Confirmation dialog before completing: "Settle account for {guest}? Total: ${amount}"
- On completion: card disappears from Departing column, dock strip slot turns teal (available)
- Does NOT process payment (v1 logs charges only)

### Guest Portal
- Route: /guest (already has layout with auth guard for guest role)
- Single-column layout, mobile-first
- Header: guest-welcome.png as banner image, "Welcome to Sunset Harbor" in font-heading
- Stay card: slip assignment (large text), check-in/departure dates
- Credentials card: gate code, Wi-Fi password, shower tokens remaining — large readable text in JetBrains Mono, high contrast bg-navy/5 background
- Charges card: itemized list matching settlement view, with running total
- No actions — guest portal is read-only

### Data Refresh
- Same pattern as Phase 2: server actions with revalidatePath
- Amenity logging action revalidates /board
- Settlement action revalidates /board
- Guest portal data fetched server-side (RSC)

### Claude's Discretion
- Exact slide-over animation timing and easing
- Amenity log list styling details
- Settlement table column widths
- Guest portal responsive breakpoints
- Empty state for guest with no charges yet

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Guest Detail & Amenity Logging
- `DESIGN-SPEC.md` §Key Components — Guest detail slide-over spec
- `DESIGN-SPEC.md` §Colors — Status colors for badges and icons
- `src/db/schema.ts` — amenityUsage, charges tables (source of truth)
- `src/db/seed.ts` — Existing amenity usage and charge records as data shape examples

### Settlement
- `DESIGN-SPEC.md` §Key Components — Settlement panel spec
- `src/db/schema.ts` — stays.status, slips.status enums for checkout state transitions

### Guest Portal
- `DESIGN-SPEC.md` §Screens — Guest portal screen spec
- `public/assets/guest-welcome.png` — Portal header image
- `src/app/guest/page.tsx` — Current placeholder to replace
- `src/app/guest/layout.tsx` — Guest layout with auth guard

### Existing Code
- `src/components/board/dispatch-board.tsx` — handleViewStay and handleSettle placeholders to wire
- `src/components/board/guest-card.tsx` — Card callbacks (onViewStay, onSettle)
- `src/app/board/actions.ts` — Existing server action patterns
- `src/lib/queries.ts` — Existing query patterns to extend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/dialog.tsx`: shadcn Dialog — use for settlement modal
- `src/components/ui/card.tsx`: shadcn Card — use for guest portal cards
- `src/components/ui/badge.tsx`: shadcn Badge — use for amenity type badges
- `src/components/ui/button.tsx`: shadcn Button — use for quick-action buttons
- `src/components/ui/input.tsx`: shadcn Input — use for fuel/power amount inputs
- `src/components/ui/separator.tsx`: shadcn Separator — use for section dividers
- `src/components/ui/tooltip.tsx`: shadcn Tooltip — use for quick-action button labels
- `public/assets/icon-shower.svg`, `icon-fuel.svg`, `icon-power.svg`, `icon-pump-out.svg`, `icon-laundry.svg` — amenity icons
- `public/assets/icon-receipt.svg`, `icon-check-out.svg` — settlement icons
- `public/assets/guest-welcome.png` — guest portal header

### Established Patterns
- Server Components for data fetching, client components for interactivity
- Server actions with revalidatePath("/board") for mutations
- Drizzle relational queries (db.query.stays.findMany with `with:`)
- Toast notifications via sonner for action feedback
- Sequential DB operations (no transactions — Neon HTTP driver)
- Tailwind v4 @theme tokens for colors

### Integration Points
- `src/components/board/dispatch-board.tsx` — Wire handleViewStay to open slide-over, handleSettle to open settlement
- `src/app/board/actions.ts` — Add logAmenity and settleAccount server actions
- `src/lib/queries.ts` — Add getStayDetail and getGuestPortalData queries
- `src/app/guest/page.tsx` — Replace placeholder with guest portal

</code_context>

<specifics>
## Specific Ideas

- Amenity logging should feel like tapping a physical button — one tap, done, confirmation toast
- Settlement should show the full financial picture clearly — no surprises for the boater
- Guest portal is the boater's "boarding pass" — clean, readable, everything they need in one scroll
- The slide-over panel keeps board context visible — staff can see the dock strip while reviewing a guest
- Quick-action buttons should use the same amenity icons as the guest card badges for visual consistency

</specifics>

<deferred>
## Deferred Ideas

- Guest rating/feedback on checkout — v2
- SMS/email credential delivery — v2
- Printable receipt generation — v2
- Shore power real-time metering — v2 (currently flat daily logging)

</deferred>

---

*Phase: 03-guest-lifecycle*
*Context gathered: 2026-03-28*
