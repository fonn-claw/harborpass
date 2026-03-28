# Phase 2: Dispatch Board & Check-In - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the three-column dispatch board (Arriving Today, Checked In, Departing Today), the visual dock strip showing all 20 transient slips color-coded by status, and the 3-step check-in wizard (guest info → visual slip assignment filtered by vessel dimensions → credential generation). After this phase, staff can see the full marina status at a glance and check in a transient boater in under 60 seconds.

</domain>

<decisions>
## Implementation Decisions

### Guest Cards
- Compact cards (~120px tall) fitting 5+ visible per column without scrolling
- Each card shows: boat icon, vessel name, slip number, guest name, vessel length/type, time info, amenity badges, and one context-dependent action button
- Left 4px color stripe indicates status: teal (#0D9488) = arriving, ocean (#1B6FA8) = checked in, rope (#C4883A) = departing
- White card on sand background, 1px fog (#E2E8F0) border, 8px border-radius
- Action button: "Check In" for arriving, "View Stay" for checked in, "Settle" for departing
- Clicking a card in Arriving opens the check-in wizard; clicking Checked In opens guest detail slide-over; clicking Departing opens settlement panel (Phase 3)

### Dock Strip
- Horizontal row of rectangular blocks (40px wide × 28px tall), 4px gap
- Each block shows slip number (small centered text)
- Color coding: teal border/light fill = available, ocean fill = occupied, rope fill = departing today, fog fill = maintenance/not-in-use
- Hover tooltip: "T-7: Sea Breeze (38' Catalina) — Departs Mar 29" (or "Available — 40' max" if empty)
- Click available slip → opens check-in wizard with that slip pre-selected in Step 2
- Click occupied slip → opens guest detail slide-over
- Horizontally scrollable if needed, with subtle overflow indicators

### Three-Column Board
- Column headers show category and count: "Arriving Today (3)", "Checked In (12)", "Departing (2)"
- Columns are equal-width, each independently scrollable when cards overflow
- Column header count updates automatically after mutations
- No drag-and-drop in v1 (deferred to v2)

### Check-In Wizard
- Modal overlay on dimmed board background
- 3 steps with progress indicator (three dots at top, not numbered)
- Step 1 (Guest & Vessel): name, vessel name, LOA, beam, draft, phone/email. Pre-filled if pre-booked guest.
- Step 2 (Slip Assignment): visual grid of available slips only those fitting vessel dimensions. Slips too small grayed out with "Too small" label. Tap to select, selected slip highlights in teal.
- Step 3 (Confirm & Credentials): summary card with auto-generated gate code (6-digit numeric), Wi-Fi password (harbor-lastname-NNNN), shower tokens (3 included). Single "Complete Check-In" button.
- Smooth slide-left transition between steps, 300ms ease-out
- X button to dismiss — confirmation dialog if any data entered
- Credentials displayed in JetBrains Mono for readability
- On completion: guest card moves from Arriving to Checked In, dock strip slot fills with ocean blue

### Board Data Refresh
- Server action revalidation via revalidatePath after check-in completes
- No WebSocket, no polling — mutations trigger server revalidation
- Board re-renders with updated data after each action

### Claude's Discretion
- Exact responsive breakpoints for column layout
- Loading skeleton while board data loads
- Error handling for failed check-in attempts
- Exact tooltip positioning and delay
- Guest detail slide-over layout (will be expanded in Phase 3 for amenity logging)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Board & Card Design
- `DESIGN-SPEC.md` §Layout Structure — Full board wireframe, column layout, dock strip specs
- `DESIGN-SPEC.md` §Key Components — Guest Card spec (dimensions, fields, color stripe, badges, action button)
- `DESIGN-SPEC.md` §Key Components — Dock Strip spec (block dimensions, colors, tooltip format, click behavior)
- `DESIGN-SPEC.md` §Motion — Check-in completion cascade animation, dock strip pulse during assignment

### Check-In Wizard
- `DESIGN-SPEC.md` §Key Components — Check-In Wizard spec (3 steps, progress indicator, slip selection grid, credential display)
- `DESIGN-SPEC.md` §Screens — Screen 2: Check-In Wizard detailed interaction description

### Design System
- `DESIGN-SPEC.md` §Colors — All 9 color tokens with hex values and usage
- `DESIGN-SPEC.md` §Typography — Font families and weights
- `DESIGN-SPEC.md` §Anti-patterns — What NOT to build (no sidebar, no stat cards, no data tables for slips)

### Database Schema
- `src/db/schema.ts` — All table definitions, enums, relations (source of truth for data queries)
- `src/db/seed.ts` — Demo data structure (understand what data exists to display)

### Existing Layout
- `src/components/layout/top-bar.tsx` — Existing top bar to integrate with
- `src/app/board/layout.tsx` — Staff board layout to build within
- `src/app/board/page.tsx` — Current placeholder to replace with dispatch board

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx`: shadcn Card component — use as base for guest cards
- `src/components/ui/badge.tsx`: shadcn Badge — use for amenity usage badges on cards
- `src/components/ui/button.tsx`: shadcn Button — use for action buttons (Check In, View Stay, Settle)
- `src/components/ui/input.tsx`: shadcn Input — use in check-in wizard form fields
- `src/components/layout/top-bar.tsx`: Navy top bar with logo, search placeholder, Check In CTA
- `public/assets/icon-*.svg`: 18 SVG icons for boats, amenities, actions
- `public/assets/empty-board.svg`: Empty state illustration

### Established Patterns
- Server Components for data fetching (board page is RSC, fetches from Drizzle)
- iron-session for auth — session available in server components via getSession()
- Tailwind v4 with @theme tokens — color-navy, color-ocean, color-teal, color-sand, color-rope, color-coral, color-slate, color-fog
- next/font for DM Sans, Inter, JetBrains Mono

### Integration Points
- `src/app/board/page.tsx` — Replace placeholder with dispatch board
- `src/components/layout/top-bar.tsx` — Wire up Check In button to open wizard modal
- `src/db/schema.ts` — Query slips, stays, guests for board data
- `src/lib/session.ts` — Access session for user context

</code_context>

<specifics>
## Specific Ideas

- The board should feel like an airport gate agent's screen — action-oriented, not data-oriented
- Dock strip gives spatial awareness similar to pointing at actual slips on the dock
- Check-in wizard must feel fast and purposeful — 3 taps (confirm info → pick slip → complete), not 15 form fields
- The visual slip selection grid in Step 2 is the key differentiator — it mirrors how staff think ("put the 38-footer in T-7")
- Card animation on check-in completion: smooth slide from Arriving to Checked In column, dock strip slot fills simultaneously

</specifics>

<deferred>
## Deferred Ideas

- Drag-and-drop slip reassignment on dock strip — v2 feature
- Guest detail slide-over with amenity logger — Phase 3
- Settlement panel for departing guests — Phase 3
- Search functionality in top bar — could be Phase 2 stretch or Phase 3

</deferred>

---

*Phase: 02-dispatch-board-check-in*
*Context gathered: 2026-03-28*
