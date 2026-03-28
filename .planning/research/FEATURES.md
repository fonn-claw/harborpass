# Feature Landscape

**Domain:** Marina guest check-in and amenity tracking (transient boater management)
**Researched:** 2026-03-28

## Table Stakes

Features users expect. Missing = product feels incomplete or staff revert to the whiteboard.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Slip availability board** | Staff need instant visual answer to "where can I put this boat?" Industry standard is visual dock maps, not tables. | Medium | Dock strip with color-coded status. Must show dimensions per slip for fit-matching. |
| **Vessel dimension matching** | Every marina system filters slips by LOA/beam/draft. Assigning a 42-footer to a 35' slip is a costly mistake. | Low | Filter available slips by vessel dimensions during check-in. Gray out slips that don't fit. |
| **Fast check-in flow** | Boaters expect <5 min processing. Industry moving toward sub-60-second digital check-in. Dockwa markets "instant" booking. | Medium | 3-step wizard: guest info, slip pick, credentials. Pre-fill for pre-booked guests. |
| **Credential generation** | Gate codes, Wi-Fi passwords, and shower access are universal marina deliverables. Scraps of paper are the status quo to beat. | Low | Auto-generate on check-in. Display in large, copy-friendly format. |
| **Amenity usage logging** | Revenue leakage from untracked amenities is the #1 financial pain point. 65% of operators cite this. | Medium | Quick-tap logging for shower, fuel, power, pump-out, laundry. Fuel needs gallons + type input. |
| **Settlement and checkout** | Itemized billing at departure is expected. 65% of boaters say transparent pricing drives satisfaction. | Medium | Itemized charges, running total, one-click settle and release slip. |
| **Guest status overview** | Staff need to know who's here, who's arriving, who's leaving -- at a glance. This is the core dispatch need. | Medium | Three-column board: Arriving / Checked In / Departing. Card-per-guest with key info. |
| **Role-based access** | Staff, manager, and guest see fundamentally different things. Universal in hospitality software. | Low | Three roles with distinct views. Session-based auth is fine for v1. |
| **Guest portal (view-only)** | Boaters expect self-service access to their stay info. Dockwa's guest portal with credentials is industry standard now. | Low | Single-page view: slip assignment, credentials, charges. Mobile-friendly. No complexity. |
| **Pricing configuration** | Managers must set nightly rates by slip size, amenity fees, fuel markup. Without this, charges can't be calculated. | Low | Simple settings page: rate per foot/night, per-amenity fees, fuel price per gallon. |
| **Occupancy reporting** | Managers need to see transient utilization. Every competitor offers occupancy dashboards. | Medium | Current occupancy, turnover rate, occupancy over time chart. |
| **Revenue reporting** | Managers need to see what transient guests generate. This is the ROI justification for the software. | Medium | Revenue by category (slip fees, fuel, amenities), revenue over time, per-guest totals. |

## Differentiators

Features that set the product apart. Not universally expected, but create competitive advantage and "wow" moments.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Spatial dock strip** | Most systems use tables or dropdowns for slip assignment. A visual dock strip that mirrors physical layout gives instant spatial awareness -- "like pointing at the real dock." | Medium | Horizontal strip of colored blocks, not a data table. Staff think spatially. This is HarborPass's signature UX. |
| **Sub-60-second check-in** | Competitors optimize for online booking, not walk-up speed. HarborPass optimizes for the dock staff standing at the counter with a boater in front of them. | Low (design, not code) | The wizard design does this. 3 taps: confirm info, pick slip, complete. Speed is a design constraint, not a feature to build. |
| **Card-to-column animation** | When check-in completes, the guest card slides from Arriving to Checked In. The dock strip slot fills simultaneously. This connects action to spatial model in a way spreadsheets never can. | Low | CSS transition, 300ms. Small investment, big "this feels alive" payoff. |
| **Repeat visitor recognition** | 78% of boaters say personalized service drives loyalty. Flagging "welcome back" guests lets staff greet them by name. | Low | Match on vessel name or guest email against history. Badge on guest card. |
| **Guest history and notes** | Beyond repeat detection: managers can see a guest's full history (previous stays, total spend, any issues). Enables VIP treatment and problem-guest awareness. | Medium | Historical stays list per guest, total lifetime spend, staff notes field. |
| **Credential copy buttons** | Staff read gate codes over VHF radio constantly. One-tap copy with large monospace display beats squinting at a printout. | Low | Copy-to-clipboard on each credential. Monospace font. Sounds trivial but is a daily friction eliminator. |
| **Printable guest welcome card** | Generate a one-page PDF with slip number, all credentials, marina rules, and a mini-map. Hand to the boater or display as QR-accessible page. | Medium | Nice-to-have for v1. Could be a future enhancement. |

## Anti-Features

Features to explicitly NOT build. These are common in competitors but wrong for HarborPass's scope and users.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Online booking / reservation engine** | Out of scope for v1. Dockwa owns this space with marketplace + 24/7 booking. HarborPass is a dock-side operations tool, not a booking platform. Building half a booking engine helps nobody. | Accept pre-booked arrivals as seeded data. Staff enter walk-ups manually. |
| **Payment processing integration** | Stripe/Square integration adds significant complexity (PCI, webhooks, error handling) for a demo product. Revenue capture matters; actual card charging does not in v1. | Log charges with amounts. Settlement marks account as "settled." No real payment flow. |
| **Email / SMS notifications** | Marina staff communicate via VHF radio and face-to-face. Boaters are on the water, not checking email. Notification infrastructure is high-cost, low-value for this context. | Credentials visible in guest portal. Staff communicate verbally. |
| **Multi-marina / tenant support** | Adds schema complexity (tenant isolation, org switching) with zero value for a single-marina deployment. Every query gets a WHERE clause for no reason. | Single-marina architecture. Hardcode Sunset Harbor Marina. |
| **Seasonal / long-term slip management** | Different workflow entirely (contracts, annual billing, waitlists). Mixing transient and seasonal in one UI dilutes the dispatch board focus. | Transient guests only (1-14 nights). Long-term slips exist in the dock strip as "not available" but aren't managed. |
| **Maintenance / work order tracking** | Facility maintenance is a separate domain. DockMaster and Molo handle this. Adding it bloats the product beyond its "guest check-in" identity. | Out of scope entirely. |
| **Fuel inventory management** | Tracking gallons dispensed per guest is in scope. Tracking fuel tank levels, reorder points, and supplier invoices is a different product (Dockwa Fuel exists for this). | Log fuel dispensed to guest with price. Don't track marina fuel inventory. |
| **Environmental / regulatory compliance** | Important for marinas but not a guest check-in concern. Pump-out logging covers the guest-facing part. | Log pump-out usage. Don't build compliance reporting. |
| **AI chatbot / voice agent** | Industry trend (DockMaster pushing AI voice reservations) but wildly out of scope for a dispatch board. | Not applicable. |

## Feature Dependencies

```
Role-based auth
  --> All views (board, manager, guest portal)

Slip data model (dimensions, status)
  --> Dock strip visualization
  --> Vessel dimension matching
  --> Check-in wizard (step 2: slip selection)

Guest + Stay data model
  --> Guest cards on the board
  --> Check-in wizard (step 1: guest info)
  --> Guest portal
  --> Guest history

Credential generation
  --> Check-in wizard (step 3: confirm + credentials)
  --> Guest portal (display credentials)
  --> Guest detail panel (copy buttons)

Amenity usage logging
  --> Settlement/checkout (itemized charges)
  --> Revenue reporting

Pricing configuration
  --> Settlement calculations
  --> Revenue reporting

Check-in flow (complete)
  --> Card animation (Arriving -> Checked In)
  --> Dock strip status update
```

## MVP Recommendation

**Phase 1 - Foundation:** Auth, data models, seed data. Without this, nothing renders.

**Phase 2 - The Board:** Dock strip + three-column dispatch board + guest cards. This is the core screen and the product's identity. Build it before any workflows so the team can see the product take shape.

**Phase 3 - Check-In Flow:** The 3-step wizard is the hero interaction. Slip assignment with dimension matching, credential generation, card animation. This is where the "60 seconds" promise lives.

**Phase 4 - Guest Lifecycle:** Amenity logging, settlement/checkout, guest detail panel, guest portal. These complete the stay lifecycle from arrival through departure.

**Phase 5 - Manager View:** Analytics, pricing config, guest history. Important but not the core user flow. Managers can wait until staff workflows are solid.

Defer to post-v1:
- **Printable welcome cards**: Nice but not blocking any workflow
- **Advanced guest search/filtering**: Basic search is enough for 20 transient slips
- **Drag-and-drop slip reassignment**: Cool but edge case for v1

## Sources

- [Dockwa Transient Booking Software](https://marinas.dockwa.com/transient-booking-software)
- [DockMaster - Marina Customer Experience](https://www.dockmaster.com/blog/marina-customer-experience)
- [Marina Management Software Features 2026](https://www.marinamatch.org/blog-detail/marina-management-software-top-features)
- [Marina Management Software Types & Benefits](https://www.marinamatch.org/blog-detail/marina-management-software-features-types-benefits)
- [Boating Industry - Evolving Expectations for Marinas](https://boatingindustry.com/news/2026/01/02/the-evolving-expectations-for-marinas/)
- [Top Marina Management Systems Comparison](https://www.lake.com/articles/top-10-marina-management-systems/)
- [DockMaster - Marina Customer Trends](https://www.dockmaster.com/blog/marina-customer-trends)
- [MarineSync - Marina Utility Management](https://www.marinesync.com/)
- [Dockwa Blog - What Boaters Wish Marinas Knew](https://blog.dockwa.com/marinas/six-things-boaters-wish-marinas-knew-about-booking)
