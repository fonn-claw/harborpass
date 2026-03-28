# Requirements: HarborPass

**Defined:** 2026-03-28
**Core Value:** Dock staff can check in a transient boater -- assign a slip, generate credentials, and hand off access info -- in under 60 seconds from a single screen.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can log in with email and password
- [ ] **AUTH-02**: User session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Users are routed to role-appropriate view after login (staff->board, manager->analytics, guest->portal)

### Slips & Vessels

- [ ] **SLIP-01**: System stores 20 transient slips with dimensions (max LOA, max beam, water depth)
- [ ] **SLIP-02**: Each slip has a status (available, occupied, departing-today, maintenance)
- [ ] **SLIP-03**: Slip assignment filters by vessel dimensions (LOA, beam, draft must fit)
- [ ] **SLIP-04**: Only one active stay can occupy a slip at a time

### Dispatch Board

- [ ] **BOARD-01**: Staff sees three swim-lane columns: Arriving Today, Checked In, Departing Today
- [ ] **BOARD-02**: Each guest appears as a card showing name, vessel, slip, and status-appropriate action button
- [ ] **BOARD-03**: Dock strip displays all 20 transient slips color-coded by status (teal=available, ocean=occupied, rope=departing, fog=maintenance)
- [ ] **BOARD-04**: Clicking a dock strip slot opens guest detail or starts check-in (if available)
- [ ] **BOARD-05**: Board updates after mutations without full page reload

### Check-In Wizard

- [ ] **CHKIN-01**: Staff can open a 3-step check-in wizard from the top bar or an arriving guest card
- [ ] **CHKIN-02**: Step 1 collects guest name, vessel name, LOA, beam, draft, and contact info
- [ ] **CHKIN-03**: Step 2 shows only slips that fit the vessel, displayed as a visual grid with dimension labels
- [ ] **CHKIN-04**: Step 3 shows summary with auto-generated gate code (6-digit), Wi-Fi password (harbor-lastname-NNNN), and shower tokens
- [ ] **CHKIN-05**: Completing check-in creates the stay, assigns the slip, and moves the guest card to Checked In column
- [ ] **CHKIN-06**: Pre-booked guests have fields pre-populated in Step 1

### Amenity Tracking

- [ ] **AMEN-01**: Staff can log shower usage with a single tap from guest detail
- [ ] **AMEN-02**: Staff can log fuel dispensed (gallons + type: diesel/gas) from guest detail
- [ ] **AMEN-03**: Staff can log shore power usage (kWh) from guest detail
- [ ] **AMEN-04**: Staff can log pump-out service from guest detail
- [ ] **AMEN-05**: Staff can log laundry token usage from guest detail
- [ ] **AMEN-06**: Each amenity log creates a charge record with timestamp and amount
- [ ] **AMEN-07**: Guest card shows amenity badges indicating what's been used

### Settlement & Checkout

- [ ] **SETL-01**: Staff can open a settlement panel for departing guests
- [ ] **SETL-02**: Settlement shows itemized charges: nightly rate x nights, fuel, showers, power, pump-out, laundry
- [ ] **SETL-03**: Settlement shows running total
- [ ] **SETL-04**: Staff can complete settlement which releases the slip and marks the stay as completed
- [ ] **SETL-05**: Completed stays are archived with full charge history

### Guest Portal

- [ ] **GUST-01**: Guest sees a single-column "My Stay" page with their slip assignment
- [ ] **GUST-02**: Guest sees credentials (gate code, Wi-Fi password, shower tokens remaining) in large readable text
- [ ] **GUST-03**: Guest sees current charges and running total
- [ ] **GUST-04**: Guest portal is mobile-friendly with large text and high contrast

### Manager View

- [ ] **MNGR-01**: Manager sees occupancy overview (occupied/available/departing counts and percentages)
- [ ] **MNGR-02**: Manager sees revenue breakdown by category (slip fees, fuel, amenities)
- [ ] **MNGR-03**: Manager can view guest history with search (past stays, repeat visitors)
- [ ] **MNGR-04**: Manager can configure pricing: per-night slip rates by size category, amenity fees, fuel price per gallon

### Demo Data

- [ ] **DEMO-01**: Seed data creates Sunset Harbor Marina with 20 transient slips of varying sizes
- [ ] **DEMO-02**: Seed creates 12 occupied stays, 3 arriving today (1 pre-booked, 2 walk-ups), 2 departing with charges
- [ ] **DEMO-03**: Seed creates 3 demo accounts (staff, manager, guest) with specified credentials
- [ ] **DEMO-04**: Seed includes realistic amenity usage history and guest history going back 2 months
- [ ] **DEMO-05**: Seed includes 1 repeat visitor with a previous stay

### Design Compliance

- [ ] **DSGN-01**: UI follows dispatch board paradigm -- no sidebar, no tabs, no stat cards
- [ ] **DSGN-02**: Color palette matches design spec (navy, ocean, teal, sand, rope, coral, slate, fog)
- [ ] **DSGN-03**: Typography uses DM Sans for headings, Inter for body, JetBrains Mono for credentials
- [ ] **DSGN-04**: All pre-generated SVG/PNG assets from public/assets/ are used as documented
- [ ] **DSGN-05**: Login screen uses hero-marina.png as full-bleed background
- [ ] **DSGN-06**: Guest portal uses guest-welcome.png as header illustration
- [ ] **DSGN-07**: Responsive design works on desktop and mobile

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Guest Experience

- **GUST-05**: Guest can rate their stay on checkout
- **GUST-06**: Guest can report an issue during stay
- **GUST-07**: Guest receives SMS/email with access credentials

### Advanced Operations

- **OPS-01**: Drag-and-drop slip reassignment on dock strip
- **OPS-02**: Real-time multi-user board updates via WebSocket
- **OPS-03**: Printable receipt generation for settlements
- **OPS-04**: Shore power metering per kWh (currently flat daily logging)

### Booking

- **BOOK-01**: Online reservation system for transient slips
- **BOOK-02**: Integration with marina booking aggregators

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment processing (Stripe, etc.) | v1 logs charges only, doesn't process cards |
| Multi-marina / multi-tenant | Single marina deployment keeps schema simple |
| Seasonal/long-term slip management | Transient guests only (1-14 nights) |
| Email/SMS notifications | Staff communicate verbally/radio |
| Mobile native app | Responsive web sufficient |
| Dark mode | Design spec uses warm sand palette, no dark variant |
| Real-time WebSocket updates | Server action revalidation sufficient for single-user demo |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| SLIP-01 | Phase 1 | Pending |
| SLIP-02 | Phase 1 | Pending |
| SLIP-03 | Phase 2 | Pending |
| SLIP-04 | Phase 1 | Pending |
| BOARD-01 | Phase 2 | Pending |
| BOARD-02 | Phase 2 | Pending |
| BOARD-03 | Phase 2 | Pending |
| BOARD-04 | Phase 2 | Pending |
| BOARD-05 | Phase 2 | Pending |
| CHKIN-01 | Phase 2 | Pending |
| CHKIN-02 | Phase 2 | Pending |
| CHKIN-03 | Phase 2 | Pending |
| CHKIN-04 | Phase 2 | Pending |
| CHKIN-05 | Phase 2 | Pending |
| CHKIN-06 | Phase 2 | Pending |
| AMEN-01 | Phase 3 | Pending |
| AMEN-02 | Phase 3 | Pending |
| AMEN-03 | Phase 3 | Pending |
| AMEN-04 | Phase 3 | Pending |
| AMEN-05 | Phase 3 | Pending |
| AMEN-06 | Phase 3 | Pending |
| AMEN-07 | Phase 3 | Pending |
| SETL-01 | Phase 3 | Pending |
| SETL-02 | Phase 3 | Pending |
| SETL-03 | Phase 3 | Pending |
| SETL-04 | Phase 3 | Pending |
| SETL-05 | Phase 3 | Pending |
| GUST-01 | Phase 3 | Pending |
| GUST-02 | Phase 3 | Pending |
| GUST-03 | Phase 3 | Pending |
| GUST-04 | Phase 3 | Pending |
| MNGR-01 | Phase 4 | Pending |
| MNGR-02 | Phase 4 | Pending |
| MNGR-03 | Phase 4 | Pending |
| MNGR-04 | Phase 4 | Pending |
| DEMO-01 | Phase 1 | Pending |
| DEMO-02 | Phase 1 | Pending |
| DEMO-03 | Phase 1 | Pending |
| DEMO-04 | Phase 1 | Pending |
| DEMO-05 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 1 | Pending |
| DSGN-04 | Phase 1 | Pending |
| DSGN-05 | Phase 1 | Pending |
| DSGN-06 | Phase 3 | Pending |
| DSGN-07 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*
