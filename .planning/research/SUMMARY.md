# Project Research Summary

**Project:** HarborPass -- Marina Guest Check-In & Amenity Access
**Domain:** Marina guest services / transient boater dispatch operations
**Researched:** 2026-03-28
**Confidence:** HIGH

## Executive Summary

HarborPass is a single-tenant marina operations tool focused on transient boater check-in and amenity revenue capture. The product is a dispatch board, not a dashboard -- staff need to see arriving, checked-in, and departing guests as actionable cards with a spatial dock strip showing slip availability. The industry standard for marina software is shifting toward sub-60-second digital check-in (Dockwa sets this bar), but competitors focus on online booking rather than walk-up speed. HarborPass differentiates by optimizing for the dock-side staff experience: fast check-in wizard, single-tap amenity logging, and visual slip assignment with vessel dimension matching.

The recommended approach is a Next.js 15 App Router application with Neon Postgres (Drizzle ORM), deploying to Vercel. The architecture is straightforward: Server Components render the board from database queries, Client Components handle interactive elements (wizard, amenity taps), and Server Actions manage all mutations inside database transactions. Authentication uses iron-session (encrypted cookies) with three roles -- no OAuth, no external auth providers. The stack is fully specified by the brief and well-documented; there are no exotic integrations or uncertain technology choices.

The primary risks are UX-oriented, not technical. The three most dangerous pitfalls are: (1) amenity logging that is too slow, causing staff to skip it and defeating the revenue capture purpose; (2) a check-in wizard that feels like data entry rather than a dispatch action; and (3) the board degenerating into a generic dashboard with stat cards instead of actionable columns. All three are design discipline problems, not engineering challenges. The mitigation is to enforce the design spec's dispatch board paradigm from the first phase and treat speed as a hard constraint on every interaction.

## Key Findings

### Recommended Stack

The stack is brief-specified and high-confidence across the board. Next.js 15.x (not 16 -- latency regressions reported), Drizzle ORM with Neon serverless driver, Tailwind 4 + shadcn/ui, and iron-session for auth. No global state management needed -- Server Components own the board data, client state is limited to wizard form steps and UI toggles.

**Core technologies:**
- **Next.js 15.x + React 19:** App Router with Server Components, Server Actions, useOptimistic for amenity logging
- **Neon Postgres + Drizzle ORM:** Serverless-friendly HTTP driver, type-safe schema-as-code, transaction support for check-in flow
- **iron-session + bcryptjs:** Lightweight encrypted cookie sessions for credential-only demo auth -- Auth.js/NextAuth is overkill
- **Tailwind 4 + shadcn/ui:** Utility CSS with copy-paste component primitives (Dialog for wizard, Sheet for settlement, Card for guest cards)
- **react-hook-form + Zod 3.x:** Multi-step wizard with client-side validation; Zod 4 deferred for ecosystem compatibility
- **Recharts:** Manager analytics charts (occupancy, revenue) -- minimal, only 2-3 charts needed
- **date-fns:** Stay duration math, departure date logic, timezone-safe calculations

**What not to use:** No Redux/Zustand (no global client state needed), no Prisma (brief says Drizzle), no tRPC (Server Actions suffice), no React Query (Server Components fetch on render), no Framer Motion (CSS transitions handle the design spec's animations).

### Expected Features

**Must have (table stakes):**
- Slip availability board with dimension-based filtering (LOA, beam, draft)
- 3-step check-in wizard under 60 seconds (guest info, slip pick, credentials)
- Credential generation (per-guest gate codes, Wi-Fi passwords, shower tokens)
- Single-tap amenity logging (shower, fuel, pump-out, laundry, shore power)
- Settlement/checkout with itemized billing
- Three-column dispatch board (Arriving / Checked In / Departing)
- Role-based access (staff, manager, guest)
- Guest portal (read-only stay info, credentials, charges)
- Pricing configuration and occupancy/revenue reporting

**Should have (differentiators):**
- Spatial dock strip (horizontal colored blocks mirroring physical layout -- HarborPass signature UX)
- Card-to-column animation on check-in completion (300ms CSS transition)
- Repeat visitor recognition (badge on guest card)
- Credential copy-to-clipboard with monospace display
- Guest history with lifetime spend and staff notes

**Defer (v2+):**
- Printable welcome cards / PDF generation
- Online booking / reservation engine
- Payment processing (Stripe/Square)
- Email/SMS notifications
- Multi-marina tenant support
- Drag-and-drop slip reassignment

### Architecture Approach

Standard Next.js App Router monolith with route groups for role-based views. Server Components fetch data directly from Neon via Drizzle query functions. Client Components handle the wizard, amenity taps, and panel toggles. Server Actions wrapped in database transactions for check-in and settlement. No API layer between Server Components and the database. Single schema.ts file for ~8-10 tables. Minimal client state -- board refreshes via revalidatePath after mutations.

**Major components:**
1. **Staff Board** -- Three-column dispatch with dock strip, the primary UI surface
2. **Check-In Wizard** -- 3-step Client Component modal; collects data locally, submits in one Server Action
3. **Amenity Logger** -- Icon grid on guest cards with optimistic updates via useOptimistic
4. **Settlement Panel** -- Slide-over sheet showing itemized charges, one-click settle and slip release
5. **Guest Portal** -- Server-rendered read-only view of the boater's stay and credentials
6. **Manager Views** -- Analytics, pricing config, guest history; separate route group

**Key schema entities:** users, guests, vessels, stays (with credentials), slips (with dimensions), amenity_usage (with price_at_time), charges, pricing

### Critical Pitfalls

1. **Amenity logging too slow** -- If logging takes more than one tap, staff skip it and revenue leaks. Build as icon grid with instant server actions + toast confirmation. Fuel is the only exception (needs gallons + type mini-form).
2. **Slip assignment ignores beam/draft** -- Slips have three constraints (LOA, beam, depth), not just length. Schema must store all three from day one; check-in must collect all three vessel dimensions.
3. **Check-in wizard bloated with fields** -- Step 1 collects only 6 fields (name, vessel name, LOA, beam, draft, contact). Everything else goes in post-check-in guest detail. Pre-booked guests pre-fill.
4. **Board becomes a dashboard** -- No stat cards, no sidebar, no tabs on the staff view. Three columns of actionable cards + dock strip. Manager analytics is a separate route.
5. **Settlement double-counts or misses charges** -- Each amenity log creates an immutable charge with price_at_time. Included shower tokens excluded from charges. Nightly charges generated per-night, not calculated at checkout.
6. **Credential usability** -- Gate codes must be 6-digit numeric, unique per active guest, avoiding ambiguous patterns. Wi-Fi in "harbor-lastname-NNNN" format. All displayed monospace with copy buttons.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Schema, Auth, Seed Data)
**Rationale:** Everything depends on the data model and authentication. Slip dimensions (LOA, beam, draft) must be in the schema from day one -- retrofitting is costly. Seed data is needed to visually verify all subsequent UI work.
**Delivers:** Database schema with all tables, iron-session auth with role-based middleware, comprehensive seed data (12 occupied slips, 3 arriving, 5 available, 2 months history)
**Addresses:** Role-based access, pricing configuration (data model)
**Avoids:** Slip dimensions incomplete (Pitfall 2), shared gate codes (Pitfall 4), Neon connection issues

### Phase 2: The Board (Dispatch UI + Dock Strip)
**Rationale:** The board is the product's identity and the primary UI surface. Building it before workflows lets the team see the product take shape and validates the dispatch paradigm early. The dock strip and swim lanes are the foundation that check-in and settlement interact with.
**Delivers:** Three-column dispatch board with guest cards, spatial dock strip with color-coded slips, role-based routing to correct views
**Addresses:** Guest status overview, slip availability board, spatial dock strip (differentiator)
**Avoids:** Board becomes dashboard (Pitfall 6)

### Phase 3: Check-In Flow (Wizard + Credentials)
**Rationale:** The hero interaction. Depends on slips (for assignment) and guests/stays (for records). The 3-step wizard with vessel dimension matching and credential generation is where the "60 seconds" promise lives.
**Delivers:** 3-step check-in wizard, vessel dimension matching with gray-out, credential generation, card animation (Arriving to Checked In), dock strip update
**Addresses:** Fast check-in, vessel dimension matching, credential generation, card-to-column animation (differentiator)
**Avoids:** Check-in too slow (Pitfall 3), credential problems (Pitfall 4)

### Phase 4: Guest Lifecycle (Amenities, Settlement, Guest Portal)
**Rationale:** Completes the stay lifecycle from arrival through departure. Amenity logging and settlement are tightly coupled (charges feed into settlement). Guest portal is low-dependency but logically groups with lifecycle completion.
**Delivers:** Single-tap amenity logging, fuel/power logging, settlement panel with itemized billing, guest detail panel, guest portal for boaters
**Addresses:** Amenity usage logging, settlement/checkout, guest portal, credential copy buttons (differentiator)
**Avoids:** Amenity logging too slow (Pitfall 1), settlement misses charges (Pitfall 5)

### Phase 5: Manager Views (Analytics, History, Pricing UI)
**Rationale:** Managers can wait until staff workflows are solid. Analytics queries run over existing data. Pricing UI replaces hardcoded seed data rates.
**Delivers:** Occupancy dashboard, revenue reports (Recharts), pricing configuration page, guest history with repeat visitor detection, staff notes
**Addresses:** Occupancy reporting, revenue reporting, pricing configuration, guest history (differentiator), repeat visitor recognition (differentiator)
**Avoids:** None critical -- standard patterns

### Phase Ordering Rationale

- **Schema before UI:** Every component depends on the data model. Getting slip dimensions, credential storage, and charge structure right in Phase 1 prevents costly migrations later.
- **Board before workflows:** The dispatch board is both the product identity and the surface that check-in/settlement interact with. Building it second validates the visual paradigm before adding complexity.
- **Check-in before amenities:** Check-in creates the guest/stay records that amenity logging and settlement operate on. Cannot log amenities without a checked-in guest.
- **Amenities and settlement together:** Settlement needs amenity charge data. Building them in the same phase ensures the charge model is consistent.
- **Manager views last:** They are read-only aggregations over data created by staff workflows. No other feature depends on them.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Check-In Flow):** The multi-step wizard with react-hook-form + Zod validation across steps, combined with Server Action submission, needs careful state management. The vessel-to-slip matching with visual gray-out is the most complex UI interaction.
- **Phase 4 (Amenity Logging):** useOptimistic pattern with Server Actions for rapid-fire taps needs careful implementation to avoid race conditions and double-logging. Debounce + server-side dedup strategy needs validation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Drizzle schema definition, iron-session setup, seed scripts -- all well-documented with official tutorials.
- **Phase 2 (Board):** Server Components rendering data into a grid layout. Standard Next.js patterns.
- **Phase 5 (Manager Views):** Recharts + aggregation queries. Straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Fully brief-specified. All technologies well-documented with official sources. Only minor uncertainty: Zod 3 vs 4 compatibility (safe choice is 3.x). |
| Features | HIGH | Clear table stakes from industry analysis. Anti-features well-defined. Scope is tight and intentional. |
| Architecture | HIGH | Standard Next.js App Router patterns. Single-tenant, small-scale (20 slips). No exotic integrations. |
| Pitfalls | HIGH | Domain-specific pitfalls (slip dimensions, amenity speed, credential usability) well-supported by industry sources. Technical pitfalls (Neon driver, revalidation) are documented. |

**Overall confidence:** HIGH

### Gaps to Address

- **Shore power metering model:** Research suggests automatic daily logging based on check-in dates, but the exact kWh tracking mechanism (flat daily fee vs actual metering) needs a decision during Phase 4 planning. Recommendation: flat daily fee for MVP, note as future enhancement.
- **Pre-booked guest data flow:** The brief mentions pre-booked arrivals but no online booking system. How pre-booked data enters the system (manual staff entry? seeded data only?) needs clarification. Recommendation: seed some guests as pre-booked with pre-filled data; staff can also manually create "expected arrivals."
- **Print/receipt for settlement:** Identified as a UX pitfall but not in the feature list. Decide during Phase 4 whether to include a print-friendly receipt view or defer.

## Sources

### Primary (HIGH confidence)
- [Next.js 15 Documentation](https://nextjs.org/blog/next-15) -- App Router, Server Components, Server Actions
- [Drizzle ORM + Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon) -- Driver setup, transactions, migrations
- [iron-session GitHub](https://github.com/vvo/iron-session) -- Session management pattern
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) -- Component setup, Tailwind v4 support
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) -- Middleware patterns, cookie auth

### Secondary (MEDIUM confidence)
- [Dockwa Transient Booking Software](https://marinas.dockwa.com/transient-booking-software) -- Industry feature expectations
- [DockMaster Blog](https://www.dockmaster.com/blog/prevent-revenue-leakage) -- Revenue leakage patterns ($47K/year)
- [Marina Management Software Features 2026](https://www.marinamatch.org/blog-detail/marina-management-software-top-features) -- Feature landscape
- [Harba Marina Study](https://harba.co/blog/marina-management-study-reveals-the-hidden-costs-of-spreadsheet-dependency-in-2025) -- Cost of manual systems

### Tertiary (LOW confidence)
- [Zod v4 Release Notes](https://zod.dev/v4) -- Ecosystem compatibility status may have changed since research

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
