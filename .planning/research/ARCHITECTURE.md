# Architecture Research

**Domain:** Marina guest check-in dispatch board (single-tenant operations tool)
**Researched:** 2026-03-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+--------------------------------------------------------------------+
|                      Presentation Layer                             |
|  +----------------+  +------------------+  +-------------------+   |
|  | Staff Board    |  | Manager Views    |  | Guest Portal      |   |
|  | (dispatch UI)  |  | (analytics/cfg)  |  | (read-only stay)  |   |
|  +-------+--------+  +--------+---------+  +---------+---------+   |
|          |                     |                      |            |
+----------+---------------------+----------------------+------------+
|                       Server Actions + API Routes                  |
|  +-------------+  +---------------+  +-------------+  +---------+ |
|  | Check-In    |  | Amenity       |  | Settlement  |  | Auth    | |
|  | Actions     |  | Actions       |  | Actions     |  | Layer   | |
|  +------+------+  +-------+-------+  +------+------+  +----+----+ |
|         |                  |                 |              |      |
+---------+------------------+-----------------+--------------+------+
|                       Data Access (Drizzle ORM)                    |
|  +----------+  +----------+  +----------+  +----------+           |
|  | Guests   |  | Stays    |  | Slips    |  | Charges  |           |
|  +----------+  +----------+  +----------+  +----------+           |
+--------------------------------------------------------------------+
|                       Neon Postgres                                 |
+--------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Staff Board | Dispatch board with 3 swim lanes, dock strip, check-in wizard | Next.js Server Components + Client Components for interactivity |
| Manager Views | Occupancy analytics, revenue reports, pricing configuration | Server Components with aggregation queries |
| Guest Portal | Read-only stay info, credentials, charges for the boater | Server Components, minimal JS |
| Check-In Actions | Guest creation, vessel registration, slip assignment, credential generation | Server Actions with transaction support |
| Amenity Actions | Log shower/fuel/power/pump-out/laundry usage, token management | Server Actions with optimistic UI |
| Settlement Actions | Calculate charges, itemize, mark as settled, release slip | Server Actions with transaction support |
| Auth Layer | Session-based authentication, role-based route protection | Middleware + server-side session cookies |
| Data Access | Schema definitions, queries, migrations | Drizzle ORM with Neon serverless driver |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   └── login/              # Login page
│   ├── (staff)/                # Staff route group (default)
│   │   ├── page.tsx            # The Board (dispatch view)
│   │   └── guests/[id]/        # Guest detail (optional deep-link)
│   ├── (manager)/              # Manager route group
│   │   ├── analytics/          # Occupancy + revenue
│   │   ├── pricing/            # Rate configuration
│   │   └── guests/             # Guest history + search
│   ├── (guest)/                # Guest portal route group
│   │   └── my-stay/            # Boater's stay view
│   ├── api/                    # API routes (if needed for client fetches)
│   └── layout.tsx              # Root layout with font loading
├── components/                 # Shared UI components
│   ├── board/                  # Dispatch board components
│   │   ├── dock-strip.tsx      # Visual slip map
│   │   ├── swim-lane.tsx       # Column container
│   │   └── guest-card.tsx      # Guest card in lane
│   ├── check-in/               # Check-in wizard steps
│   │   ├── wizard.tsx          # Wizard container + state
│   │   ├── step-guest.tsx      # Step 1: guest + vessel info
│   │   ├── step-slip.tsx       # Step 2: visual slip picker
│   │   └── step-confirm.tsx    # Step 3: credentials + confirm
│   ├── settlement/             # Settlement panel
│   │   └── settlement-panel.tsx
│   ├── amenity/                # Amenity logger
│   │   └── amenity-logger.tsx
│   └── ui/                     # Generic primitives (buttons, modals, etc.)
├── lib/                        # Shared utilities
│   ├── db/                     # Database layer
│   │   ├── index.ts            # Drizzle client instance
│   │   ├── schema.ts           # All table definitions
│   │   └── seed.ts             # Demo data seeding
│   ├── actions/                # Server Actions
│   │   ├── check-in.ts         # Check-in flow actions
│   │   ├── amenity.ts          # Amenity logging actions
│   │   ├── settlement.ts       # Settlement actions
│   │   └── auth.ts             # Login/logout actions
│   ├── queries/                # Read-only data fetching
│   │   ├── board.ts            # Board data (today's arrivals, checked-in, departing)
│   │   ├── slips.ts            # Slip availability + dimensions
│   │   ├── guests.ts           # Guest history + search
│   │   └── analytics.ts        # Manager aggregations
│   ├── auth.ts                 # Session management utilities
│   ├── credentials.ts          # Gate code, Wi-Fi password, token generation
│   └── utils.ts                # General helpers
├── middleware.ts                # Auth + role-based routing
└── drizzle.config.ts           # Drizzle migration config
```

### Structure Rationale

- **Route groups `(auth)`, `(staff)`, `(manager)`, `(guest)`:** Enforce role-based layouts without nesting URLs. Staff see the board at `/`, manager gets `/analytics`, guest gets `/my-stay`. The parentheses mean these don't appear in the URL path.
- **`components/` by feature, not by type:** Board components, check-in wizard, settlement panel, and amenity logger are each a distinct feature. Grouping by feature keeps related components together and makes it obvious what each piece of UI needs.
- **`lib/actions/` separate from `lib/queries/`:** Server Actions (mutations) are architecturally distinct from data-fetching functions (reads). Actions use transactions and have side effects; queries are pure reads used by Server Components. This separation prevents accidentally mixing mutation logic into rendering paths.
- **Single `schema.ts`:** For a single-marina app with ~8-10 tables, one schema file is simpler than splitting per-entity. Drizzle schema files are declarative and read top-to-bottom.

## Architectural Patterns

### Pattern 1: Server Components for Data, Client Components for Interaction

**What:** Default to Server Components (RSC) for all data fetching and layout. Promote to Client Components only for interactive elements (wizard steps, amenity tap buttons, dock strip hover states).
**When to use:** Every page and data-display component.
**Trade-offs:** Maximizes performance and minimizes client bundle. Requires careful boundary placement -- you cannot use hooks in Server Components, so interactive islands must be explicitly marked `"use client"`.

**Example:**
```typescript
// app/(staff)/page.tsx — Server Component (no "use client")
import { getBoardData } from "@/lib/queries/board";
import { DockStrip } from "@/components/board/dock-strip";
import { SwimLane } from "@/components/board/swim-lane";

export default async function BoardPage() {
  const { arriving, checkedIn, departing, slips } = await getBoardData();
  return (
    <main>
      <DockStrip slips={slips} />
      <div className="grid grid-cols-3">
        <SwimLane title="Arriving Today" guests={arriving} />
        <SwimLane title="Checked In" guests={checkedIn} />
        <SwimLane title="Departing" guests={departing} />
      </div>
    </main>
  );
}
```

### Pattern 2: Server Actions with Optimistic Updates for Fast UX

**What:** Use Next.js Server Actions for all mutations (check-in, amenity logging, settlement). For high-frequency actions like amenity taps, use `useOptimistic` to update the UI immediately before the server responds.
**When to use:** All mutation flows, especially amenity logging where dock staff are tapping quickly.
**Trade-offs:** Simpler than building API routes + client-side fetch. Optimistic updates add complexity but are necessary for the "one-tap amenity logging" UX.

**Example:**
```typescript
// Amenity logging with optimistic update
"use client";
import { useOptimistic } from "react";
import { logAmenityUsage } from "@/lib/actions/amenity";

function AmenityLogger({ guestId, currentUsage }) {
  const [optimisticUsage, addOptimistic] = useOptimistic(
    currentUsage,
    (state, amenityType) => ({
      ...state,
      [amenityType]: (state[amenityType] || 0) + 1,
    })
  );

  async function handleTap(amenityType: string) {
    addOptimistic(amenityType);
    await logAmenityUsage(guestId, amenityType);
  }

  return (/* icon grid with tap handlers */);
}
```

### Pattern 3: Transactional Check-In with Credential Generation

**What:** The check-in flow (create guest, assign slip, generate credentials) must execute as a single database transaction. If any step fails, everything rolls back. Credential generation (gate codes, Wi-Fi passwords) happens inside the transaction to ensure consistency.
**When to use:** Check-in and settlement flows -- any multi-step mutation where partial completion would leave bad state.
**Trade-offs:** Slightly more complex than sequential inserts, but prevents orphaned records (e.g., slip marked occupied but no guest record created).

**Example:**
```typescript
// lib/actions/check-in.ts
export async function completeCheckIn(data: CheckInData) {
  return db.transaction(async (tx) => {
    const guest = await tx.insert(guests).values({...}).returning();
    const credentials = generateCredentials(guest[0].id, data.lastName);
    const stay = await tx.insert(stays).values({
      guestId: guest[0].id,
      slipId: data.slipId,
      gateCode: credentials.gateCode,
      wifiPassword: credentials.wifiPassword,
      showerTokens: 3, // included tokens
    }).returning();
    await tx.update(slips)
      .set({ status: "occupied", currentStayId: stay[0].id })
      .where(eq(slips.id, data.slipId));
    return { guest: guest[0], stay: stay[0], credentials };
  });
}
```

## Data Flow

### Request Flow

```
[Staff taps "Check In"]
    |
[Check-In Wizard (Client Component)]
    |
    v
[Server Action: completeCheckIn()]
    |
    v
[Drizzle Transaction]
    |-- INSERT guests
    |-- INSERT stays (with generated credentials)
    |-- UPDATE slips (mark occupied)
    |-- INSERT included_amenity_tokens
    |
    v
[revalidatePath("/")]  -->  [Board re-renders with new data]
```

### State Management

This app needs minimal client state. The board is server-rendered and refreshed via `revalidatePath` after mutations. The only meaningful client state lives in:

1. **Check-in wizard:** Multi-step form state held in the wizard's local React state (useState/useReducer). Not global -- disposed when wizard closes.
2. **Optimistic amenity counts:** Managed via `useOptimistic` per guest card. Reconciled on next server render.
3. **Modal/panel open state:** Simple boolean state for wizard overlay, settlement panel, guest detail.

No global state store (Redux, Zustand) is needed. Server Components + revalidation handle the board state. Client Components manage only transient interaction state.

### Key Data Flows

1. **Board refresh:** Server Components fetch board data on every render. After any Server Action, `revalidatePath("/")` triggers a re-render. The board always reflects current DB state.
2. **Check-in:** Wizard collects data client-side across 3 steps, submits everything in one Server Action call. Server responds with credentials, wizard shows confirmation, then closes and board refreshes.
3. **Amenity logging:** Single tap fires Server Action. Optimistic update shows immediately. Board refreshes in background.
4. **Settlement:** Panel fetches all charges for a stay (Server Component data). "Settle" button fires Server Action that marks stay settled, releases slip, revalidates board.
5. **Guest portal:** Entirely server-rendered. Guest's session determines which stay to show. No mutations from guest side (except optional feedback).

## Database Schema (Core Entities)

```
users (id, email, password_hash, name, role: staff|manager|guest)
    |
guests (id, user_id?, name, phone, email, notes, is_vip, created_at)
    |
    +-- vessels (id, guest_id, name, type, loa, beam, draft)
    |
    +-- stays (id, guest_id, vessel_id, slip_id, status: arriving|checked_in|departed,
    |         check_in_at, expected_departure, actual_departure,
    |         gate_code, wifi_password, shower_tokens_remaining,
    |         notes, created_at)
    |         |
    |         +-- amenity_usage (id, stay_id, type: shower|fuel|power|pump_out|laundry,
    |         |                  quantity, unit, price_at_time, logged_at, logged_by)
    |         |
    |         +-- charges (id, stay_id, description, amount, category, created_at)
    |
slips (id, number: "T-1".."T-20", max_loa, max_beam, max_draft,
       has_power, has_water, status: available|occupied|maintenance,
       current_stay_id?)
    |
pricing (id, category: slip_nightly|shower_token|fuel_diesel|fuel_gas|power_kwh|...,
         rate, effective_from)
```

Key design decisions:
- **`price_at_time` on amenity_usage:** Captures the rate when the charge was incurred, not the current rate. Prevents retroactive pricing changes from corrupting historical charges.
- **`shower_tokens_remaining` on stays:** Simpler than a separate token ledger. Decrement on use, charge only when buying extra.
- **Guests separate from users:** Not every guest needs a login. The guest portal is optional -- `user_id` on guests is nullable.
- **Charges as a derived view:** Charges can be computed from `amenity_usage` + `stays` (nightly rate x nights). A `charges` table is useful for manual adjustments or discounts but the settlement panel should calculate from source data.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 marina, 20 slips | Monolith is perfect. Single Neon DB, single Vercel deployment. No caching needed. |
| 5 marinas | Add `marina_id` column to all tables, filter by tenant. Still one DB. |
| 50+ marinas | Separate DBs per marina or row-level security. Connection pooling becomes important. |

### Scaling Priorities

1. **First bottleneck (unlikely to hit):** Concurrent board refreshes. If many staff members are viewing the board simultaneously and it revalidates frequently, Neon's serverless cold starts could add latency. Mitigation: use `unstable_cache` or ISR with short revalidation (5-10s) for the board query.
2. **Second bottleneck:** Seed/migration time. With 2 months of guest history, the seed script needs to be efficient. Use batch inserts, not row-by-row.

This app is fundamentally small-scale (20 transient slips, 2-3 staff). Over-engineering for scale would be an anti-pattern itself.

## Anti-Patterns

### Anti-Pattern 1: Building an API Layer Between Server Components and the Database

**What people do:** Create REST API routes, then fetch them from Server Components or client-side.
**Why it's wrong:** In Next.js App Router, Server Components can query the database directly. Adding an API layer between RSC and Drizzle adds indirection, extra round-trips, and serialization overhead for no benefit.
**Do this instead:** Fetch data directly in Server Components via query functions in `lib/queries/`. Use Server Actions for mutations. Only create API routes if a non-Next.js client needs the data.

### Anti-Pattern 2: Global State Store for Board Data

**What people do:** Fetch board data into Zustand/Redux, then render from client-side state.
**Why it's wrong:** The board is the canonical view of database state. A client-side cache creates a second source of truth that drifts. Server Components already solve this -- they render fresh data on every request.
**Do this instead:** Let Server Components own the board data. Use `revalidatePath` after mutations. Client state is only for transient interaction (wizard form values, optimistic updates).

### Anti-Pattern 3: Over-Normalizing the Schema

**What people do:** Create separate tables for gate codes, Wi-Fi passwords, and every credential type with a polymorphic credentials table.
**Why it's wrong:** Credentials are 1:1 with a stay and always accessed together. Normalizing them into separate tables adds JOINs for the most common query (show guest card with credentials) with no practical benefit.
**Do this instead:** Store credentials directly on the `stays` row. They are generated once at check-in and never change during the stay.

### Anti-Pattern 4: Multi-Page Check-In Flow

**What people do:** Use separate routes for each check-in step (`/check-in/step-1`, `/check-in/step-2`, etc.).
**Why it's wrong:** Each page navigation loses wizard state unless you persist to the server. It is slow (full page loads) and breaks the "under 60 seconds" requirement. The design spec explicitly calls this out as an anti-pattern.
**Do this instead:** A single Client Component wizard with internal step state. All data stays in React state until final submission. One Server Action call to persist everything.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon Postgres | Drizzle ORM with `@neondatabase/serverless` driver | Use connection pooling URL for Drizzle. Neon's serverless driver handles HTTP-based queries from edge/serverless. |
| Vercel | Deploy target | No special integration needed beyond env vars (DATABASE_URL, SESSION_SECRET). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Staff Board <-> Check-In Wizard | Client-side: wizard is a modal triggered from board, shares no state | Wizard completion fires Server Action, board refreshes via revalidation |
| Staff Board <-> Settlement Panel | Client-side: panel slides over from board, receives stay ID as prop | Settlement Action revalidates board on completion |
| Staff Board <-> Amenity Logger | Client-side: inline in guest detail, fires Server Actions per tap | Optimistic updates for fast UX |
| Auth Middleware <-> Route Groups | Server-side: middleware checks session, redirects based on role | Staff -> `/`, Manager -> `/analytics`, Guest -> `/my-stay` |
| Queries <-> Schema | Direct import: query functions import from schema and db client | No abstraction layer between them |

## Build Order (Dependency Chain)

The components have clear dependencies that dictate build order:

1. **Database schema + auth** (foundation) -- everything depends on these
2. **Seed data** -- needed to visually verify all subsequent UI work
3. **Board page with swim lanes** -- the primary UI, needs schema + seed
4. **Dock strip** -- visual layer on top of slip data, can parallel with board
5. **Check-in wizard** -- the core interaction, needs slips + guests + stays
6. **Guest detail + amenity logging** -- extends checked-in cards
7. **Settlement panel** -- needs amenity/charge data to calculate totals
8. **Guest portal** -- independent read-only view, low dependency
9. **Manager views** -- analytics queries over existing data, build last

Items 3-4 can be built in parallel. Items 6-7 are sequential (settlement needs amenity data). Item 8 can be built anytime after auth + schema.

## Sources

- Next.js App Router architecture patterns: based on Next.js official documentation for Server Components, Server Actions, and route groups
- Drizzle ORM transaction support and Neon integration: standard patterns from Drizzle documentation
- Design constraints: DESIGN-SPEC.md (dispatch board paradigm, component specs, anti-patterns)
- Domain requirements: BRIEF.md (check-in flow, amenity types, credential formats)

---
*Architecture research for: Marina guest check-in dispatch board*
*Researched: 2026-03-28*
