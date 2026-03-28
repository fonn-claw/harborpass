# Phase 1: Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the project scaffolding (Next.js + Drizzle + Neon), authentication with role-based routing, comprehensive seed data for Sunset Harbor Marina, and the design system (colors, typography, layout shell). After this phase, all three demo accounts can log in and reach role-appropriate placeholder views, and the database is populated with realistic marina data for subsequent phases to build against.

</domain>

<decisions>
## Implementation Decisions

### Login Screen
- Full-bleed hero-marina.png background image covering the viewport
- Centered floating white card with HarborPass logo, email/password fields, sign-in button
- Subtle shadow on the login card, 8px border-radius
- Demo account hints displayed below the login form for easy testing (3 accounts with roles)
- Use design spec colors: navy headings, ocean interactive elements, sand accents

### Seed Data
- Realistic American boater names and real boat manufacturer/model names (Catalina, Beneteau, Boston Whaler, etc.)
- Vessel dimensions should be realistic for each boat type (LOA 24-55ft range for transient slips)
- Dates anchored relative to current date — "today" is always the busy Friday scenario
- 20 transient slips (T-1 through T-20) with varying max dimensions (small: 30ft, medium: 40ft, large: 55ft)
- 12 occupied stays with staggered arrival dates (1-7 days ago)
- 3 arriving today: 1 pre-booked (reservation record exists), 2 walk-ups (no prior record)
- 2 departing today with mixed amenity charges to settle
- 1 repeat visitor with a completed stay from ~4 weeks ago
- Guest history going back 2 months (~15-20 past completed stays
- Amenity usage scattered across current guests (showers, fuel, power, pump-out)
- Pricing config seeded: slip rates by size, amenity fees, fuel price per gallon

### Design System
- shadcn/ui components customized to design spec palette
- Tailwind v4 with custom theme tokens matching DESIGN-SPEC.md colors
- Google Fonts via next/font: DM Sans (600, 700), Inter (400, 500), JetBrains Mono (400)
- All SVG icons from public/assets/ integrated as React components or img tags
- Layout shell: full-width top bar with logo + marina name + action area, no sidebar, no tabs
- Sand (#F5F0E8) page background, navy (#0F2B46) top bar

### Authentication
- iron-session for cookie-based session management (lightweight, no OAuth complexity)
- Password hashing with bcrypt for demo accounts
- Middleware checks session and redirects based on role: staff→/board, manager→/manager, guest→/guest
- Login/logout server actions
- Session survives browser refresh (persistent cookie)

### Role Placeholder Pages
- Staff board page: branded placeholder with "Dispatch Board — Phase 2" message, dispatch board layout shell visible
- Manager page: branded placeholder with "Analytics — Phase 4" message
- Guest portal: branded placeholder with "Guest Portal — Phase 3" message
- All placeholders use the correct layout structure and design system (proving the design works end-to-end)

### Claude's Discretion
- Exact Drizzle schema column types and constraints
- Database migration strategy
- Middleware implementation pattern (Next.js middleware vs server-side checks)
- Seed script execution approach (npm script vs migration)
- Error handling on login failures

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `DESIGN-SPEC.md` — Complete UI paradigm, layout structure, color palette, typography, component specs, motion design, and anti-patterns
- `DESIGN-SPEC.md` §Asset Manifest — SVG icon specs and decorative image usage

### Domain Context
- `BRIEF.md` — Marina terminology, user roles, demo data scenario, tech stack requirements
- `BRIEF.md` §Demo Data — Exact seed data scenario (Sunset Harbor Marina, busy Friday)
- `BRIEF.md` §Demo Accounts — Three accounts with credentials and roles

### Project Decisions
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/research/STACK.md` — Technology recommendations (iron-session, shadcn, Tailwind v4, etc.)
- `.planning/research/PITFALLS.md` — Slip dimension schema requirements, credential generation rules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/assets/logo.svg` (200x48): Top bar brand mark
- `public/assets/logo-icon.svg` (32x32): Favicon
- `public/assets/hero-marina.png` (1024x1024): Login screen background
- `public/assets/icon-*.svg`: 18 functional icons for amenities, actions, navigation
- `public/assets/empty-board.svg` (240x160): Empty state illustration

### Established Patterns
- None yet — this is Phase 1, establishing all patterns

### Integration Points
- None yet — greenfield project

</code_context>

<specifics>
## Specific Ideas

- Login screen should feel like arriving at a marina — warm, inviting golden-hour atmosphere from the hero image
- Demo credential hints should be unobtrusive but discoverable — not hidden, not dominating
- The layout shell established here must be the dispatch board paradigm from day one — no dashboard drift allowed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-28*
