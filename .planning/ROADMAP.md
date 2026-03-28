# Roadmap: HarborPass

## Overview

HarborPass delivers a marina dispatch board in four phases: first the foundation (schema, auth, seed data, design system), then the core dispatch board with check-in wizard (the product's identity), then the full guest lifecycle (amenities, settlement, guest portal), and finally manager analytics and pricing. Each phase delivers a complete, verifiable capability that builds on the previous one.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Schema, authentication, seed data, and design system
- [ ] **Phase 2: Dispatch Board & Check-In** - Three-column board, dock strip, and 3-step check-in wizard
- [ ] **Phase 3: Guest Lifecycle** - Amenity logging, settlement/checkout, and guest portal
- [ ] **Phase 4: Manager Views** - Occupancy analytics, revenue reporting, pricing config, and guest history

## Phase Details

### Phase 1: Foundation
**Goal**: Staff can log in, see role-appropriate routing, and the database contains realistic marina data to build against
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, SLIP-01, SLIP-02, SLIP-04, DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-07
**Success Criteria** (what must be TRUE):
  1. User can log in with demo credentials and is routed to their role-appropriate view (staff sees board placeholder, manager sees analytics placeholder, guest sees portal placeholder)
  2. User session survives browser refresh and user can log out from any page
  3. Login screen displays hero-marina.png as full-bleed background with correct typography and color palette
  4. Database contains 20 transient slips with dimensions, 12 occupied stays, 3 arriving today, 2 departing, 3 demo accounts, and 2 months of guest history
  5. Application renders with dispatch board layout (no sidebar, no tabs), correct fonts (DM Sans, Inter, JetBrains Mono), and design spec colors
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD
- [ ] 01-03: TBD

### Phase 2: Dispatch Board & Check-In
**Goal**: Staff can see the full marina status at a glance and check in a transient boater in under 60 seconds
**Depends on**: Phase 1
**Requirements**: BOARD-01, BOARD-02, BOARD-03, BOARD-04, BOARD-05, CHKIN-01, CHKIN-02, CHKIN-03, CHKIN-04, CHKIN-05, CHKIN-06, SLIP-03
**Success Criteria** (what must be TRUE):
  1. Staff sees three swim-lane columns (Arriving Today, Checked In, Departing Today) populated with guest cards showing name, vessel, slip, and action buttons
  2. Dock strip displays all 20 transient slips color-coded by status, and clicking a slip opens guest detail or starts check-in
  3. Staff can complete the 3-step check-in wizard (guest info, slip selection filtered by vessel dimensions, credential summary) and the guest card moves to Checked In
  4. Check-in generates a 6-digit gate code, harbor-lastname-NNNN Wi-Fi password, and shower tokens displayed in monospace
  5. Pre-booked guests have their fields pre-populated in Step 1 of the wizard
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Guest Lifecycle
**Goal**: Staff can track all amenity usage during a stay, settle accounts on departure, and guests can view their own stay info
**Depends on**: Phase 2
**Requirements**: AMEN-01, AMEN-02, AMEN-03, AMEN-04, AMEN-05, AMEN-06, AMEN-07, SETL-01, SETL-02, SETL-03, SETL-04, SETL-05, GUST-01, GUST-02, GUST-03, GUST-04, DSGN-06
**Success Criteria** (what must be TRUE):
  1. Staff can log shower, fuel, shore power, pump-out, and laundry usage from a guest detail view with single-tap actions (fuel requires gallons and type)
  2. Guest cards show amenity badges indicating which services have been used
  3. Staff can open a settlement panel for departing guests showing itemized charges (nightly rate, fuel, showers, power, pump-out, laundry) with a running total
  4. Completing settlement releases the slip, archives the stay with full charge history, and removes the guest from the board
  5. Guest logs in and sees a mobile-friendly portal with slip assignment, credentials in large readable text, current charges, and guest-welcome.png header
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Manager Views
**Goal**: Manager can monitor marina performance, configure pricing, and review guest history
**Depends on**: Phase 3
**Requirements**: MNGR-01, MNGR-02, MNGR-03, MNGR-04
**Success Criteria** (what must be TRUE):
  1. Manager sees occupancy overview with occupied, available, and departing counts and percentages
  2. Manager sees revenue breakdown by category (slip fees, fuel, amenities) with charts
  3. Manager can search guest history and identify repeat visitors and past stays
  4. Manager can configure per-night slip rates by size category, amenity fees, and fuel price per gallon
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Dispatch Board & Check-In | 0/3 | Not started | - |
| 3. Guest Lifecycle | 0/3 | Not started | - |
| 4. Manager Views | 0/2 | Not started | - |
