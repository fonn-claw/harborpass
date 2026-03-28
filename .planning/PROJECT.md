# HarborPass

## What This Is

HarborPass is a dispatch board application for marina dock staff to manage transient boater check-ins, amenity tracking, and departures. It replaces the chaotic whiteboard-and-radio workflow with a real-time status board showing who's arriving, who's here, and who's leaving — enabling staff to process arrivals in under 60 seconds and capture all amenity revenue.

## Core Value

Dock staff can check in a transient boater — assign a slip, generate credentials, and hand off access info — in under 60 seconds from a single screen.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Role-based authentication (staff, manager, guest)
- [ ] Dispatch board with three swim lanes (Arriving, Checked In, Departing)
- [ ] Visual dock strip showing slip status at a glance
- [ ] 3-step check-in wizard (guest info → slip assignment → credentials)
- [ ] Slip assignment with vessel dimension matching
- [ ] Auto-generated credentials (gate code, Wi-Fi password, shower tokens)
- [ ] Amenity usage logging (shower, fuel, power, pump-out, laundry)
- [ ] Settlement/checkout with itemized charges
- [ ] Guest portal showing stay info, credentials, and charges
- [ ] Manager analytics (occupancy, revenue, guest history, pricing config)
- [ ] Realistic demo data (Sunset Harbor Marina, busy Friday in summer)

### Out of Scope

- Online booking/reservations — v1 is walk-up and pre-booked arrivals only
- Payment processing integration — v1 logs charges, doesn't process cards
- Email/SMS notifications — staff communicate verbally or via radio
- Mobile native app — responsive web is sufficient
- Multi-marina support — single marina deployment
- Seasonal/long-term slip management — transient guests only

## Context

- Part of the Sunset Harbor Marina universe (same as SlipSync, DockWatch, BillingHub)
- Marina has 60 total slips, 20 designated transient (T-1 through T-20)
- Transient stays are 1-14 nights
- Three user roles: dock staff (primary), marina manager, transient boater (guest)
- UI paradigm is a dispatch board (NOT admin panel) — see DESIGN-SPEC.md
- Pre-generated SVG icons and decorative images in public/assets/
- Gate codes: 6-digit numeric; Wi-Fi: "harbor-lastname-NNNN" format
- Shower/laundry: token-based (included tokens + purchasable)
- Shore power: metered kWh per slip per day
- Fuel: gallons + type (diesel/gas) with price per gallon

## Constraints

- **Tech stack**: Next.js App Router, Neon Postgres, Drizzle ORM — specified by brief
- **Database**: Neon Postgres only (NOT SQLite)
- **Deployment**: Vercel
- **Design**: Must follow DESIGN-SPEC.md exactly — dispatch board layout, no sidebar, specific color palette and typography
- **Assets**: Must use pre-generated assets in public/assets/
- **Demo data**: Must be seeded with realistic Sunset Harbor Marina scenario

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dispatch board UI (not admin panel) | Staff need action-oriented view, not data tables | — Pending |
| Token-based amenities | Simple increment/decrement, no complex metering | — Pending |
| Session-based auth (not JWT) | Simpler for server-rendered app, no token refresh complexity | — Pending |
| Single-marina architecture | Keeps schema simple, no tenant isolation needed | — Pending |

---
*Last updated: 2026-03-28 after initialization*
