# Phase 2: Dispatch Board & Check-In - Research

**Researched:** 2026-03-28
**Domain:** Next.js Server Components, Drizzle ORM queries, multi-step wizard UI, server actions
**Confidence:** HIGH

## Summary

Phase 2 transforms the placeholder board page into a fully functional dispatch board with three swim-lane columns, a visual dock strip, and a 3-step check-in wizard. The existing codebase provides a solid foundation: the database schema, seed data, auth/session layer, Tailwind theme tokens, and shadcn/ui base components are all in place. The primary technical challenges are (1) writing efficient Drizzle queries that join stays/guests/slips with amenity badge data, (2) building a client-side multi-step wizard with form state preservation across steps, and (3) implementing the server action that atomically creates a guest, stay, assigns a slip, and generates credentials.

The architecture is straightforward: the board page is a Server Component that fetches all today's data. The dock strip and columns render from that data. The check-in wizard is a client component (modal overlay) that uses react-hook-form for the 3-step flow and calls a server action on completion. revalidatePath("/board") after the server action refreshes the board.

**Primary recommendation:** Build the board as a single RSC page with data-fetching functions, extract the dock strip and columns as presentational server components, and make only the check-in wizard and interactive card click handlers client components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Guest cards: compact (~120px tall), white on sand, left 4px color stripe (teal=arriving, ocean=checked-in, rope=departing), 1px fog border, 8px radius
- Each card shows: boat icon, vessel name, slip number, guest name, vessel length/type, time info, amenity badges, one action button
- Action buttons: "Check In" for arriving, "View Stay" for checked in, "Settle" for departing
- Dock strip: horizontal row of 40x28px blocks, 4px gap, slip number centered, color-coded (teal=available, ocean=occupied, rope=departing, fog=maintenance)
- Dock strip hover tooltip: "T-7: Sea Breeze (38' Catalina) -- Departs Mar 29" format
- Click available dock strip slot opens check-in wizard with slip pre-selected in Step 2
- Three columns: equal-width, independently scrollable, headers show count
- No drag-and-drop in v1
- Check-in wizard: modal overlay, 3 dots progress indicator, 3 steps (guest info / slip selection / confirm+credentials)
- Step 2 slip grid: only fitting slips active, too-small grayed with "Too small" label, tap to select, selected highlights teal
- Credentials: 6-digit gate code, harbor-lastname-NNNN Wi-Fi, 3 shower tokens, displayed in JetBrains Mono
- Board refresh: server action revalidation via revalidatePath, no WebSocket, no polling
- Smooth slide-left transition between wizard steps (300ms ease-out)
- X button to dismiss wizard, confirmation dialog if data entered
- On completion: card moves from Arriving to Checked In, dock strip fills ocean blue

### Claude's Discretion
- Exact responsive breakpoints for column layout
- Loading skeleton while board data loads
- Error handling for failed check-in attempts
- Exact tooltip positioning and delay
- Guest detail slide-over layout (expanded in Phase 3)

### Deferred Ideas (OUT OF SCOPE)
- Drag-and-drop slip reassignment -- v2
- Guest detail slide-over with amenity logger -- Phase 3
- Settlement panel for departing guests -- Phase 3
- Search functionality in top bar -- Phase 3 or later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BOARD-01 | Three swim-lane columns: Arriving Today, Checked In, Departing Today | Board data query groups stays by status; RSC renders three Column components |
| BOARD-02 | Each guest card shows name, vessel, slip, action button | GuestCard component with data from joined stays+guests+slips query |
| BOARD-03 | Dock strip displays 20 slips color-coded by status | Slip query with status; DockStrip component maps slips to colored blocks |
| BOARD-04 | Click dock strip slot opens guest detail or starts check-in | Client-side onClick handlers on dock strip blocks, state to open wizard |
| BOARD-05 | Board updates after mutations without full page reload | revalidatePath("/board") in server action; Next.js re-renders RSC |
| CHKIN-01 | 3-step check-in wizard opens from top bar or arriving card | CheckInWizard client component, triggered by button click, receives optional guest/slip props |
| CHKIN-02 | Step 1 collects guest name, vessel name, LOA, beam, draft, contact | react-hook-form with zod validation schema |
| CHKIN-03 | Step 2 shows only fitting slips as visual grid | Slip filtering: vesselLoa <= maxLoa AND vesselBeam <= maxBeam AND vesselDraft <= waterDepth |
| CHKIN-04 | Step 3 shows summary with auto-generated credentials | Credential generation functions (already exist in seed.ts as patterns) |
| CHKIN-05 | Completing check-in creates stay, assigns slip, moves card | Server action: insert guest + insert stay + update slip status in transaction |
| CHKIN-06 | Pre-booked guests have fields pre-populated | Pass existing guest+stay data as defaultValues to wizard form |
| SLIP-03 | Slip assignment filters by vessel dimensions | SQL WHERE clause: maxLoa >= vessel.loa AND maxBeam >= vessel.beam AND waterDepth >= vessel.draft |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.14 | App Router, Server Components, Server Actions | Framework already in use |
| drizzle-orm | 0.45.2 | Database queries, relations | ORM already configured with Neon |
| react-hook-form | 7.72.0 | Multi-step wizard form state | Already installed, ideal for wizard pattern |
| zod | 3.25.76 | Form validation schemas | Already installed, pairs with react-hook-form |
| @hookform/resolvers | 5.2.2 | Zod resolver for react-hook-form | Already installed |
| date-fns | 4.1.0 | Date formatting for cards and tooltips | Already installed |
| sonner | 2.0.7 | Toast notifications for check-in success | Already installed |

### New Components Needed (shadcn/ui)
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| dialog | Check-in wizard modal overlay | Wizard container with backdrop dimming |
| tooltip | Dock strip hover information | Slip hover details |
| separator | Visual dividers in wizard steps | Between form sections |
| skeleton | Loading state for board | While RSC data loads |
| label | Form field labels in wizard | Step 1 and Step 2 labels |
| select | Vessel type or expected nights dropdown | Optional fields in Step 1 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn dialog | Custom modal with portal | shadcn dialog handles focus trap, escape key, backdrop -- don't hand-roll |
| shadcn tooltip | CSS title attribute | title has no styling control, tooltip gives themed positioning |
| Framer Motion for wizard transitions | CSS transitions | CSS transitions sufficient for slide-left; Framer adds bundle weight for no real gain |

**Installation:**
```bash
npx shadcn@latest add dialog tooltip separator skeleton label
```

No new npm packages needed. Everything required is already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/board/
    page.tsx              # RSC: fetches board data, renders layout
    layout.tsx            # Auth guard (already exists)
    actions.ts            # Server actions: checkInGuest
  components/board/
    dispatch-board.tsx    # Main board layout (3 columns + dock strip)
    board-column.tsx      # Single swim-lane column with header + scrollable cards
    guest-card.tsx        # Individual guest card (server component)
    dock-strip.tsx        # Horizontal slip map (client component for hover/click)
    dock-strip-block.tsx  # Single slip block in dock strip
  components/check-in/
    check-in-wizard.tsx   # Client component: modal + step orchestration
    step-guest-info.tsx   # Step 1: guest & vessel form
    step-slip-select.tsx  # Step 2: visual slip grid with filtering
    step-credentials.tsx  # Step 3: summary + generated credentials
    slip-block.tsx        # Visual slip block for Step 2 grid
  lib/
    queries.ts            # Drizzle query functions for board data
    credentials.ts        # Gate code, Wi-Fi password, shower token generation
```

### Pattern 1: Server Component Data Fetching with Client Islands
**What:** The board page.tsx is a Server Component that fetches all data in parallel, then passes it down. Only interactive elements (dock strip clicks, wizard modal, card action buttons) are client components.
**When to use:** Always for this board -- the data is read-heavy, mutations are infrequent.
**Example:**
```typescript
// src/app/board/page.tsx
import { getBoardData, getAllSlips } from "@/lib/queries";
import { DispatchBoard } from "@/components/board/dispatch-board";

export default async function BoardPage() {
  const [boardData, slips] = await Promise.all([
    getBoardData(),
    getAllSlips(),
  ]);
  return <DispatchBoard data={boardData} slips={slips} />;
}
```

### Pattern 2: Multi-Step Wizard with react-hook-form
**What:** Single form instance shared across all 3 steps. useForm at the wizard level, pass register/control down to each step. Step navigation validates only current step's fields before advancing.
**When to use:** For the check-in wizard.
**Example:**
```typescript
// src/components/check-in/check-in-wizard.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkInSchema, type CheckInFormData } from "@/lib/schemas";

export function CheckInWizard({ availableSlips, preBookedGuest, preSelectedSlipId, onClose }) {
  const [step, setStep] = useState(1);
  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: preBookedGuest ? {
      guestName: preBookedGuest.name,
      vesselName: preBookedGuest.vesselName,
      loa: preBookedGuest.vesselLoa,
      beam: preBookedGuest.vesselBeam,
      draft: preBookedGuest.vesselDraft,
      phone: preBookedGuest.phone,
      email: preBookedGuest.email,
      slipId: preSelectedSlipId ?? undefined,
    } : {
      slipId: preSelectedSlipId ?? undefined,
    },
  });

  // Validate only current step fields before advancing
  const nextStep = async () => {
    const fieldsToValidate = step === 1
      ? ["guestName", "vesselName", "loa", "beam", "draft"] as const
      : step === 2
      ? ["slipId"] as const
      : [];
    const valid = await form.trigger(fieldsToValidate);
    if (valid) setStep(s => Math.min(s + 1, 3));
  };
  // ...
}
```

### Pattern 3: Server Action with revalidatePath
**What:** Server action performs the mutation (insert guest, insert stay, update slip), then calls revalidatePath("/board") to refresh the RSC.
**When to use:** For check-in completion.
**Example:**
```typescript
// src/app/board/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { guests, stays, slips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateGateCode, generateWifiPassword } from "@/lib/credentials";

export async function checkInGuest(data: CheckInInput) {
  // 1. Insert or update guest
  const [guest] = await db.insert(guests).values({
    name: data.guestName,
    vesselName: data.vesselName,
    vesselLoa: data.loa,
    vesselBeam: data.beam,
    vesselDraft: data.draft,
    phone: data.phone,
    email: data.email,
  }).returning();

  // 2. Generate credentials
  const gateCode = generateGateCode();
  const wifiPassword = generateWifiPassword(data.guestName.split(" ").pop()!);

  // 3. Create stay
  const [stay] = await db.insert(stays).values({
    guestId: data.existingGuestId ?? guest.id,
    slipId: data.slipId,
    checkIn: new Date(),
    expectedDeparture: data.expectedDeparture,
    status: "checked_in",
    gateCode,
    wifiPassword,
    showerTokens: 3,
    showerTokensUsed: 0,
    nightlyRate: data.nightlyRate,
    isPreBooked: data.isPreBooked ?? false,
  }).returning();

  // 4. Update slip status
  await db.update(slips)
    .set({ status: "occupied" })
    .where(eq(slips.id, data.slipId));

  // 5. If pre-booked, update existing stay status
  if (data.existingStayId) {
    await db.update(stays)
      .set({ status: "checked_in", slipId: data.slipId, gateCode, wifiPassword, showerTokens: 3 })
      .where(eq(stays.id, data.existingStayId));
  }

  // 6. Revalidate board
  revalidatePath("/board");

  return { success: true, gateCode, wifiPassword, showerTokens: 3 };
}
```

### Anti-Patterns to Avoid
- **Fetching data in client components:** Board data must come from the RSC page, not useEffect+fetch in client components. Pass data as props to client islands.
- **Individual API calls per card:** Fetch all board data in one or two queries, not N+1 per guest.
- **Storing wizard state in URL params:** Use component state. The wizard is a modal overlay, not a routed page.
- **Using `use client` on the entire board:** Only the interactive parts (dock strip clicks, wizard, card buttons) need to be client components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay with focus trap | Custom portal + escape handler | shadcn Dialog | Handles a11y, focus trap, escape, backdrop click, scroll lock |
| Tooltip positioning | CSS hover + absolute div | shadcn Tooltip | Handles viewport edge detection, delay, animation |
| Form validation | Manual if/else checks | zod + react-hook-form | Already installed, handles per-field errors, step validation |
| Gate code generation | Complex crypto | `Math.floor(100000 + Math.random() * 900000)` | Seed.ts already uses this exact pattern -- reuse it |
| Wi-Fi password generation | UUID-based | `harbor-${lastName}-${4digits}` | Seed.ts pattern, human-readable by design |
| Loading skeletons | Custom divs with animate-pulse | shadcn Skeleton | Consistent styling, already themed |

**Key insight:** The seed.ts file already contains the credential generation logic (gateCode, wifiPass functions). Extract these into a shared `lib/credentials.ts` rather than reimplementing.

## Common Pitfalls

### Pitfall 1: Neon HTTP driver doesn't support transactions
**What goes wrong:** Attempting to use `db.transaction()` with the Neon HTTP driver throws an error. The project uses `neon()` (HTTP), not `neonConfig` (WebSocket).
**Why it happens:** Neon HTTP driver (`@neondatabase/serverless` with `neon()`) communicates via single HTTP requests. Transactions require a persistent connection.
**How to avoid:** For the check-in server action, perform sequential inserts. The risk of partial failure is low for a demo app. If atomicity is critical, wrap in a try/catch and implement compensating deletes on failure. Alternatively, the Neon HTTP driver supports `sql.transaction()` at the SQL level for simple cases.
**Warning signs:** Runtime error "transactions are not supported" when calling `db.transaction()`.

### Pitfall 2: Server action return values with revalidatePath
**What goes wrong:** After calling `revalidatePath`, the server action's return value may not propagate correctly if the component re-renders.
**Why it happens:** revalidatePath triggers a re-render of the RSC tree. The client component calling the action needs to handle the response before the revalidation kicks in.
**How to avoid:** Return credentials from the server action, capture them in the wizard's onSubmit handler, and display them in Step 3 BEFORE the board re-renders. The wizard modal stays open showing credentials while the board updates behind it.

### Pitfall 3: Pre-booked guest check-in flow
**What goes wrong:** Creating a duplicate guest record when the guest already exists (from the reservation).
**Why it happens:** The seed creates guests with stays in "reserved" status. Check-in should UPDATE the existing stay, not create a new one.
**How to avoid:** When checking in a pre-booked guest, pass the existing guestId and stayId. The server action updates the existing stay (set status to "checked_in", assign slipId, set credentials) rather than inserting new records.

### Pitfall 4: Slip status not matching stay data
**What goes wrong:** Slip status says "available" but a stay record references it, or vice versa.
**Why it happens:** Forgetting to update slip status when creating/modifying a stay.
**How to avoid:** Always update slip status in the same server action that modifies stays. The seed data maintains this invariant -- follow the same pattern.

### Pitfall 5: Tailwind v4 class naming
**What goes wrong:** Using Tailwind v3 syntax that doesn't work in v4.
**Why it happens:** The project uses Tailwind v4 with the new `@theme` system. Custom colors are defined as `--color-navy`, `--color-ocean`, etc.
**How to avoid:** Use `text-navy`, `bg-ocean`, `border-teal` etc. directly. These work because `--color-*` tokens are defined in the `@theme inline` block in globals.css. Do NOT use `text-[#0F2B46]` -- use the semantic tokens.

## Code Examples

### Board Data Query
```typescript
// src/lib/queries.ts
import { db } from "@/db";
import { stays, guests, slips, amenityUsage } from "@/db/schema";
import { eq, and, gte, lte, or, sql, ne } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

export async function getBoardData() {
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // Arriving today: stays with checkIn today and status "reserved"
  // Checked in: stays with status "checked_in" and NOT departing today
  // Departing today: stays with status "checked_in" and expectedDeparture today
  // (also slips with status "departing_today")

  const allActiveStays = await db.query.stays.findMany({
    where: or(
      eq(stays.status, "checked_in"),
      and(
        eq(stays.status, "reserved"),
        gte(stays.checkIn, today),
        lte(stays.checkIn, todayEnd),
      ),
    ),
    with: {
      guest: true,
      slip: true,
      amenityUsages: true,
    },
  });

  const arriving = allActiveStays.filter(
    s => s.status === "reserved" && s.checkIn >= today && s.checkIn <= todayEnd
  );
  const departingToday = allActiveStays.filter(
    s => s.status === "checked_in" && s.expectedDeparture >= today && s.expectedDeparture <= todayEnd
  );
  const checkedIn = allActiveStays.filter(
    s => s.status === "checked_in" && !(s.expectedDeparture >= today && s.expectedDeparture <= todayEnd)
  );

  return { arriving, checkedIn, departingToday };
}

export async function getAllSlips() {
  return db.query.slips.findMany({
    with: {
      stays: {
        where: or(
          eq(stays.status, "checked_in"),
          eq(stays.status, "reserved"),
        ),
        with: { guest: true },
        limit: 1,
      },
    },
    orderBy: (slips, { asc }) => [asc(slips.name)],
  });
}

export async function getAvailableSlips() {
  return db.query.slips.findMany({
    where: or(
      eq(slips.status, "available"),
    ),
    orderBy: (slips, { asc }) => [asc(slips.name)],
  });
}
```

### Slip Filtering Logic for Wizard Step 2
```typescript
// Filter slips that can fit the vessel
function filterSlipsByVessel(
  slips: Slip[],
  vesselLoa: number,
  vesselBeam: number,
  vesselDraft: number,
) {
  return slips.map(slip => ({
    ...slip,
    fits: slip.maxLoa >= vesselLoa && slip.maxBeam >= vesselBeam && slip.waterDepth >= vesselDraft,
  }));
}
```

### Credential Generation
```typescript
// src/lib/credentials.ts
export function generateGateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateWifiPassword(lastName: string): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `harbor-${lastName.toLowerCase()}-${digits}`;
}
```

### Wizard Slide Transition CSS
```css
/* Applied to wizard step container */
.wizard-step-enter {
  transform: translateX(100%);
  opacity: 0;
}
.wizard-step-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}
.wizard-step-exit {
  transform: translateX(0);
  opacity: 1;
}
.wizard-step-exit-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}
```

Alternatively, simpler approach with Tailwind:
```typescript
// In the wizard component, use CSS transitions on a wrapper
<div className="overflow-hidden">
  <div
    className="flex transition-transform duration-300 ease-out"
    style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
  >
    <div className="w-full flex-shrink-0"><StepGuestInfo /></div>
    <div className="w-full flex-shrink-0"><StepSlipSelect /></div>
    <div className="w-full flex-shrink-0"><StepCredentials /></div>
  </div>
</div>
```

### Amenity Badges on Guest Cards
```typescript
// Derive amenity badges from amenityUsages relation data
function getAmenityBadges(amenityUsages: AmenityUsage[]) {
  const types = new Set(amenityUsages.map(a => a.type));
  return Array.from(types).map(type => ({
    type,
    icon: AMENITY_ICONS[type], // maps to /assets/icon-*.svg paths
    label: AMENITY_LABELS[type],
  }));
}

const AMENITY_ICONS: Record<string, string> = {
  shower: "/assets/icon-shower.svg",
  fuel: "/assets/icon-fuel.svg",
  shore_power: "/assets/icon-power.svg",
  pump_out: "/assets/icon-pump-out.svg",
  laundry: "/assets/icon-laundry.svg",
};
```

### Nightly Rate Determination
```typescript
// Determine rate based on slip size
function getNightlyRate(slipSize: "small" | "medium" | "large"): number {
  const rates = { small: 5500, medium: 8500, large: 12500 }; // cents
  return rates[slipSize];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getServerSideProps | Server Components (RSC) | Next.js 13+ (stable 14+) | Data fetching in component, no API layer needed |
| API routes for mutations | Server Actions | Next.js 14+ | Direct function calls from client, no fetch boilerplate |
| useState for forms | react-hook-form + zod | Long-standing | Cleaner validation, less re-renders, step-based validation |
| CSS Modules | Tailwind v4 @theme | Tailwind v4 | Theme tokens via CSS custom properties |

## Open Questions

1. **Expected departure date in check-in wizard**
   - What we know: Seed data creates stays with expectedDeparture. Walk-ups need to specify how many nights.
   - What's unclear: Whether Step 1 should include a "nights" or "expected departure" field.
   - Recommendation: Add an "Expected nights" field to Step 1 (default 1). Calculate expectedDeparture as checkIn + nights. This is quick to fill in and natural for dock staff.

2. **Nightly rate assignment**
   - What we know: Pricing table has rates by slip size. Seed uses hardcoded rates matching slip sizes.
   - What's unclear: Should rate come from the pricing table or be hardcoded per size?
   - Recommendation: Query the pricing table for rates. This aligns with MNGR-04 (configurable pricing in Phase 4). For now, look up rate by slip size from the pricing table.

3. **Sorting within board columns**
   - What we know: Arriving and departing columns have few items. Checked In can have 12+.
   - What's unclear: Sort order within each column.
   - Recommendation: Arriving: by checkIn time ascending (earliest first). Checked In: by expectedDeparture ascending (leaving soonest at top). Departing: by expectedDeparture ascending.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet configured |
| Config file | None -- Wave 0 |
| Quick run command | `npx jest --passWithNoTests` or manual verification |
| Full suite command | `npm run build` (type-check + build validation) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOARD-01 | Three columns render with correct grouping | smoke | `npm run build` (no runtime errors) | N/A |
| BOARD-02 | Guest cards show correct data | manual | Visual inspection of seeded data | N/A |
| BOARD-03 | Dock strip shows 20 slips with correct colors | manual | Visual inspection | N/A |
| BOARD-04 | Click dock strip opens wizard/detail | manual | Click interaction test | N/A |
| BOARD-05 | Board refreshes after check-in | manual | Complete check-in, verify card moves | N/A |
| CHKIN-01 | Wizard opens from top bar and arriving card | manual | Click both triggers | N/A |
| CHKIN-02 | Step 1 collects all fields with validation | manual | Try submitting empty, verify errors | N/A |
| CHKIN-03 | Step 2 filters slips by dimensions | manual | Enter large vessel dims, verify small slips grayed | N/A |
| CHKIN-04 | Step 3 shows generated credentials | manual | Complete steps 1-2, verify credentials appear | N/A |
| CHKIN-05 | Check-in creates stay and updates slip | manual | Complete wizard, verify DB + board state | N/A |
| CHKIN-06 | Pre-booked guest has pre-filled fields | manual | Click arriving pre-booked card, verify fields | N/A |
| SLIP-03 | Slip filtering by dimensions | unit | Could test filterSlipsByVessel function | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors and import issues)
- **Per wave merge:** `npm run build` + manual board interaction test
- **Phase gate:** Build passes + all manual checks above verified

### Wave 0 Gaps
- [ ] No test framework configured -- for this phase, `npm run build` is the primary automated check
- [ ] Unit test for slip filtering logic could be added but is low priority given it's a simple comparison
- [ ] Manual smoke test checklist is the primary verification method for UI-heavy phase

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` -- All table definitions, enums, relations (reviewed in full)
- `src/db/seed.ts` -- Credential generation patterns, data shape, stay statuses
- `DESIGN-SPEC.md` -- Full visual spec, component specs, motion spec
- `02-CONTEXT.md` -- All locked decisions and constraints

### Secondary (MEDIUM confidence)
- Next.js App Router patterns -- Server Components, Server Actions, revalidatePath (well-documented, stable in Next 15)
- react-hook-form multi-step pattern -- standard approach, widely documented
- Drizzle ORM relational queries -- documented API, matches project's existing usage

### Tertiary (LOW confidence)
- Neon HTTP transaction limitations -- verified from Neon docs that HTTP driver has limited transaction support; sequential operations recommended for this use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and configured in the project
- Architecture: HIGH -- follows established Next.js App Router patterns already in use in Phase 1
- Pitfalls: MEDIUM -- Neon transaction limitation needs confirmation during implementation; revalidatePath behavior is well-documented but edge cases exist
- Data queries: HIGH -- schema is well-defined, seed data provides exact shape examples

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving dependencies)
