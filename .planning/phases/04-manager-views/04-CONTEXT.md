# Phase 4: Manager Views - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the manager dashboard with occupancy overview, revenue analytics, guest history search, and pricing configuration. After this phase, managers can monitor marina performance, review guest history, and configure pricing from their dedicated view.

</domain>

<decisions>
## Implementation Decisions

### Manager Dashboard Layout
- Route: /manager (already has layout with auth guard for manager role)
- Single-page dashboard with card-based sections, vertically stacked
- No sidebar — consistent with dispatch board paradigm (cards/sections, not admin panel tabs)
- Top bar same as staff view but without Check In button
- Sections: Occupancy Overview, Revenue Breakdown, Guest History, Pricing Config

### Occupancy Overview
- Card with 3 stat boxes: Occupied (count + percentage), Available (count), Departing Today (count)
- Percentage based on 20 transient slips total
- Simple visual: horizontal bar showing occupied vs available ratio, color-coded (ocean=occupied, teal=available, rope=departing)
- Real-time from DB query (current slip statuses)

### Revenue Breakdown
- Card showing revenue by category: Slip Fees, Fuel, Showers, Shore Power, Pump-Out, Laundry
- Each category: total amount from charges table for current month
- Simple bar chart using CSS (no charting library) — horizontal bars with proportional widths
- Total revenue prominently displayed
- Time filter: "This Month" default (no date picker for v1 — show current month only)

### Guest History
- Searchable list of all guest stays (past and current)
- Search by guest name or vessel name (client-side filter from server-fetched data)
- Each row: guest name, vessel, slip, check-in date, checkout date (or "Current"), total charges, repeat visitor badge
- Sort by most recent stay first
- Clicking a row expands to show full charge breakdown (accordion pattern)
- Repeat visitor indicator: if guest has >1 stay record

### Pricing Configuration
- Editable table of all pricing entries from the pricing table
- Categories: Nightly Rates (small, medium, large), Amenity Fees (shower, laundry, pump-out, shore power per kWh), Fuel (diesel per gallon, gas per gallon)
- Inline editing: click a rate to edit, enter new value, save
- Server action to update pricing table
- Toast confirmation on save
- Values displayed as dollars (converted from cents in DB)

### Claude's Discretion
- Exact card dimensions and spacing
- Search input styling
- Accordion animation for guest history expansion
- Pricing edit interaction pattern (inline vs modal)
- Empty states for sections with no data

</decisions>

<canonical_refs>
## Canonical References

### Database
- `src/db/schema.ts` — pricing, charges, stays, slips, guests tables
- `src/db/seed.ts` — Existing pricing values, charge categories

### Existing Code
- `src/app/manager/page.tsx` — Current placeholder to replace
- `src/app/manager/layout.tsx` — Manager layout with auth guard
- `src/lib/queries.ts` — Existing query patterns to extend
- `src/lib/format.ts` — formatCurrency, formatDate helpers
- `src/app/globals.css` — Theme tokens

### Design
- `DESIGN-SPEC.md` — Color palette, typography, anti-patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable
- `src/components/ui/card.tsx` — For dashboard sections
- `src/components/ui/input.tsx` — For search and price editing
- `src/components/ui/badge.tsx` — For repeat visitor badge
- `src/components/ui/button.tsx` — For save/edit actions
- `src/components/ui/separator.tsx` — For section dividers
- `src/lib/format.ts` — formatCurrency, formatDate

### Patterns
- Server Components for data fetching
- Server actions for mutations (pricing updates)
- revalidatePath for refresh after pricing changes
- Tailwind v4 @theme tokens

</code_context>

<deferred>
## Deferred Ideas

- Date range picker for revenue filtering — v2
- Export/CSV download for reports — v2
- Comparative analytics (month-over-month) — v2
- Guest feedback/rating display — v2

</deferred>

---

*Phase: 04-manager-views*
*Context gathered: 2026-03-28*
