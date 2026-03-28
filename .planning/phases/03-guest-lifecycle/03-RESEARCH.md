# Phase 3: Guest Lifecycle - Research

**Researched:** 2026-03-28
**Domain:** Guest detail panel, amenity logging, settlement/checkout, guest portal
**Confidence:** HIGH

## Summary

Phase 3 implements three major features: (1) a slide-over guest detail panel with amenity logging quick actions, (2) a settlement modal for departing guests, and (3) a read-only guest portal. All required data structures (amenityUsage, charges, pricing, stays) already exist in the schema with seed data providing clear data shape examples. The existing server action pattern (server actions + revalidatePath) and Drizzle relational queries provide a solid foundation.

The main technical gap is the shadcn Sheet component (not yet installed) needed for the slide-over panel. A Popover component is also needed for fuel/power quantity inputs. The guest portal requires a query that maps the logged-in user (users table) to their guest record (guests table) via email match. All pricing data is seeded and follows a consistent cents-based integer pattern.

**Primary recommendation:** Install shadcn Sheet and Popover components, then build the three features using the established server action + revalidatePath pattern with Drizzle relational queries.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Guest detail: right-side slide-over panel, 400px wide desktop, full-width mobile
- Opens from "View Stay" button on checked-in cards OR clicking occupied dock strip slot
- Content sections: header, stay info, credentials, amenity log, quick-action buttons
- Amenity logging: row of icon buttons at bottom of slide-over
- Shower: deducts token if remaining, else $3 charge. Pump-out: $15. Laundry: $5. Shore power: kWh input at $0.12/kWh. Fuel: gallons + type popover form
- Settlement: modal dialog (not slide-over), itemized charges table with nightly rate x nights + amenity charges
- "Complete Checkout" marks stay as checked_out, releases slip (status -> available)
- Does NOT process payment (v1 logs charges only)
- Guest portal: /guest route, single-column mobile-first, read-only
- Header: guest-welcome.png banner, "Welcome to Sunset Harbor"
- Credentials in JetBrains Mono with bg-navy/5 background
- Data refresh: server actions with revalidatePath, same as Phase 2

### Claude's Discretion
- Exact slide-over animation timing and easing
- Amenity log list styling details
- Settlement table column widths
- Guest portal responsive breakpoints
- Empty state for guest with no charges yet

### Deferred Ideas (OUT OF SCOPE)
- Guest rating/feedback on checkout -- v2
- SMS/email credential delivery -- v2
- Printable receipt generation -- v2
- Shore power real-time metering -- v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AMEN-01 | Staff can log shower usage with single tap | Shower logging: check showerTokensUsed vs showerTokens, create amenityUsage + charge if tokens depleted |
| AMEN-02 | Staff can log fuel (gallons + type) | Fuel popover form with gallons input + diesel/gas select, pricing from pricing table |
| AMEN-03 | Staff can log shore power (kWh) | kWh input popover, pricing at $0.12/kWh from pricing table |
| AMEN-04 | Staff can log pump-out service | Single-tap, $15 flat fee from pricing table |
| AMEN-05 | Staff can log laundry token usage | Single-tap, $5 flat fee from pricing table |
| AMEN-06 | Each amenity log creates charge record | addAmenity pattern from seed.ts: insert amenityUsage + insert charge in sequence |
| AMEN-07 | Guest card shows amenity badges | Already implemented in guest-card.tsx via amenityUsages relation |
| SETL-01 | Staff can open settlement for departing guests | Settlement Dialog triggered from "Settle" button on departing cards |
| SETL-02 | Settlement shows itemized charges | Query all charges for stay, group by category (slip, amenity, fuel) |
| SETL-03 | Settlement shows running total | Sum all charges.amount for the stay |
| SETL-04 | Staff completes settlement: releases slip, marks stay completed | Update stays.status to checked_out, stays.checkOut to now, slips.status to available |
| SETL-05 | Completed stays archived with full charge history | Charges persist in DB; stay status = checked_out serves as archive |
| GUST-01 | Guest sees "My Stay" page with slip assignment | Query via user email -> guests.email -> active stay with slip relation |
| GUST-02 | Guest sees credentials in large readable text | JetBrains Mono, bg-navy/5 cards, gate code + wifi + shower tokens |
| GUST-03 | Guest sees current charges and running total | Same charge query as settlement, rendered read-only |
| GUST-04 | Guest portal mobile-friendly with large text | Single-column layout, already has mobile-first guest layout |
| DSGN-06 | Guest portal uses guest-welcome.png header | public/assets/guest-welcome.png exists, use as banner image |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.14 | App Router, server actions, RSC | Project foundation |
| drizzle-orm | 0.45.2 | Database queries with relations | Already used for all queries |
| iron-session | 8.0.4 | Session management (userId, role) | Guest portal auth |
| sonner | 2.0.7 | Toast notifications | Action feedback |
| date-fns | 4.1.0 | Date formatting and calculations | Night count calculation |
| zod | 3.25.76 | Schema validation | Server action input validation |

### shadcn Components Needed (install via CLI)
| Component | Purpose | Status |
|-----------|---------|--------|
| Sheet | Slide-over guest detail panel | NOT INSTALLED -- must add |
| Popover | Fuel gallons/type input, shore power kWh input | NOT INSTALLED -- must add |
| Table | Settlement itemized charges display | NOT INSTALLED -- optional, can use plain HTML table |
| ScrollArea | Amenity log scrolling in slide-over | NOT INSTALLED -- optional, can use overflow-y-auto |

### Already Installed
| Component | Purpose |
|-----------|---------|
| Dialog | Settlement modal |
| Card | Guest portal cards |
| Badge | Amenity type badges |
| Button | Quick-action buttons |
| Input | Fuel/power amount inputs |
| Separator | Section dividers |
| Tooltip | Quick-action button labels |

**Installation:**
```bash
npx shadcn@latest add sheet popover
```

## Architecture Patterns

### Recommended File Structure
```
src/
  app/
    board/
      actions.ts           # ADD: logAmenity, settleAccount server actions
    guest/
      page.tsx             # REPLACE: placeholder -> full guest portal
      layout.tsx           # EXISTS: auth guard for guest role
  components/
    board/
      dispatch-board.tsx   # MODIFY: wire handleViewStay and handleSettle
      guest-detail-panel.tsx   # NEW: slide-over panel (Sheet-based)
      amenity-logger.tsx       # NEW: quick-action icon buttons + popovers
      settlement-modal.tsx     # NEW: Dialog with itemized charges
    guest/
      stay-card.tsx            # NEW: guest portal stay info card
      credentials-card.tsx     # NEW: guest portal credentials card
      charges-card.tsx         # NEW: guest portal charges card
  lib/
    queries.ts             # ADD: getStayDetail, getGuestPortalData, getSettlementData
```

### Pattern 1: Server Action for Amenity Logging
**What:** Single server action that handles all amenity types with a discriminated union input
**When to use:** All amenity logging from the slide-over panel

```typescript
// src/app/board/actions.ts
"use server";

type AmenityInput =
  | { type: "shower"; stayId: number }
  | { type: "pump_out"; stayId: number }
  | { type: "laundry"; stayId: number }
  | { type: "shore_power"; stayId: number; kWh: number }
  | { type: "fuel"; stayId: number; gallons: number; fuelType: "diesel" | "gas" };

export async function logAmenity(input: AmenityInput) {
  // 1. Look up pricing from pricing table
  // 2. Calculate total amount
  // 3. For shower: check stay.showerTokensUsed < stay.showerTokens
  //    If tokens remain: increment showerTokensUsed, create amenityUsage with $0 charge
  //    If depleted: create amenityUsage + charge at $3
  // 4. Insert amenityUsage record
  // 5. Insert charge record (if applicable)
  // 6. revalidatePath("/board")
  // 7. Return { success, message } for toast
}
```

### Pattern 2: Settlement Server Action
**What:** Multi-step checkout that updates stay status and releases slip
**When to use:** "Complete Checkout" button in settlement modal

```typescript
export async function settleAccount(stayId: number) {
  // 1. Update stays: status = "checked_out", checkOut = new Date()
  // 2. Get the slip ID from the stay
  // 3. Update slips: status = "available"
  // 4. revalidatePath("/board")
  // 5. Return { success }
}
```

### Pattern 3: Guest Portal Data Lookup
**What:** Map session userId -> user email -> guest record -> active stay
**When to use:** Guest portal page (RSC)

```typescript
export async function getGuestPortalData(userId: number) {
  // 1. Get user from users table by id
  // 2. Find guest record where guests.email matches user.email
  // 3. Find active stay (status = "checked_in") for that guest
  // 4. Include slip, amenityUsages, charges relations
  // 5. Return full stay data or null
}
```

### Pattern 4: Client-Side State for Panels
**What:** The dispatch-board manages slide-over and settlement state
**When to use:** dispatch-board.tsx state management

```typescript
// In dispatch-board.tsx
const [detailStayId, setDetailStayId] = useState<number | null>(null);
const [settleStayId, setSettleStayId] = useState<number | null>(null);

// handleViewStay opens the slide-over
const handleViewStay = useCallback((stay: StayData) => {
  setDetailStayId(stay.id);
}, []);

// handleSettle opens the settlement modal
const handleSettle = useCallback((stay: StayData) => {
  setSettleStayId(stay.id);
}, []);

// handleSlipClick for occupied/departing slips opens detail
const handleSlipClick = useCallback((slip: SlipWithStay) => {
  if (slip.status === "available") { /* existing wizard logic */ }
  else if (slip.stays[0]) { setDetailStayId(slip.stays[0].id); } // or the stayId
}, []);
```

### Anti-Patterns to Avoid
- **Fetching stay detail client-side:** The slide-over should receive the stayId and fetch data server-side. But since dispatch-board is a client component, it needs the full stay data passed as props (already available from BoardData) or use a pattern where the Sheet content is a server component. Given the current architecture, pass the stay data from BoardData props + fetch additional detail via a server action or separate RSC.
- **Custom modal implementation:** Use shadcn Dialog (already installed) for settlement, not a hand-rolled modal.
- **Inline pricing constants:** Always look up pricing from the pricing table, never hardcode $3, $5, $15 etc.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slide-over panel | Custom positioned div with animations | shadcn Sheet (side="right") | Handles overlay, focus trap, animation, scroll lock, accessibility |
| Settlement modal | Custom modal | shadcn Dialog (already installed) | Same reasons as above |
| Popover for fuel/power inputs | Custom dropdown | shadcn Popover | Position management, click-outside, keyboard nav |
| Toast notifications | Custom notification system | sonner (already installed) | Already wired in the app |
| Date calculations | Manual date math | date-fns differenceInDays, format | Edge cases with timezones |

## Common Pitfalls

### Pitfall 1: Guest Portal User-to-Guest Mapping
**What goes wrong:** The session has `userId` (from users table), but guest data is in the `guests` table. There's no foreign key between users and guests.
**Why it happens:** The guest demo user (Sam Mitchell, guest@harborpass.app) exists in both `users` (for login) and `guests` (for stay data), linked only by email.
**How to avoid:** Query users table to get email, then query guests table by email, then find the active stay. Always handle the case where no matching guest/stay is found.
**Warning signs:** Guest portal shows empty or errors for logged-in guest user.

### Pitfall 2: Shower Token Logic
**What goes wrong:** Charging for shower when tokens remain, or not creating a charge when tokens are depleted.
**Why it happens:** Two fields: `showerTokens` (total allocated, default 3) and `showerTokensUsed` (counter). Need to compare before deciding on charge.
**How to avoid:**
- If `showerTokensUsed < showerTokens`: increment `showerTokensUsed`, create amenityUsage with totalAmount=0 (included token), no charge record
- If `showerTokensUsed >= showerTokens`: create amenityUsage with totalAmount=300, create charge record for $3
**Warning signs:** showerTokensUsed exceeds showerTokens, or paid charges appear for guests with remaining tokens.

### Pitfall 3: Cents vs Dollars Display
**What goes wrong:** Displaying 8500 instead of $85.00 in the settlement panel.
**Why it happens:** All amounts in the database are stored in cents (integers). The pricing table, charges, and amenityUsage all use cents.
**How to avoid:** Always divide by 100 and format with 2 decimal places for display: `(amount / 100).toFixed(2)`. Create a formatCurrency helper.
**Warning signs:** Unrealistically large numbers in the settlement total.

### Pitfall 4: Nightly Rate Calculation in Settlement
**What goes wrong:** Incorrect night count or double-counting existing nightly charge records.
**Why it happens:** The seed data pre-creates nightly charge records (one per night). Settlement needs to sum existing charges, NOT recalculate from scratch.
**How to avoid:** Settlement total = sum of ALL charges.amount for the stay (which already includes nightly charges created during the stay). Do NOT multiply nightlyRate * nights separately -- those charges already exist in the charges table.
**Warning signs:** Settlement total is double the expected amount.

### Pitfall 5: Stale Data After Amenity Logging
**What goes wrong:** Amenity log in slide-over doesn't reflect the just-logged item.
**Why it happens:** revalidatePath refreshes the page RSC data, but the slide-over is client-side state.
**How to avoid:** After logAmenity server action succeeds, revalidatePath("/board") will re-render the server component. The dispatch board will get new props. If the slide-over stays open, it needs to reflect the updated data from new props. Use the stayId to find the updated stay in the new BoardData props.
**Warning signs:** User logs a shower but the amenity list doesn't update until they close and reopen the panel.

### Pitfall 6: Settlement Slip Status for Non-Departing Guests
**What goes wrong:** Attempting to settle a guest whose slip is "occupied" not "departing_today".
**Why it happens:** The settle button appears on departing cards, but the dock strip slot status might still be "occupied" if the date boundary hasn't been processed.
**How to avoid:** The settleAccount action should work regardless of current slip status -- it always sets slip to "available". Don't gate on departing_today status.

## Code Examples

### Query: getStayDetail
```typescript
// In src/lib/queries.ts
export async function getStayDetail(stayId: number) {
  return db.query.stays.findFirst({
    where: eq(stays.id, stayId),
    with: {
      guest: true,
      slip: true,
      amenityUsages: {
        orderBy: (au, { desc }) => [desc(au.createdAt)],
      },
      charges: {
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      },
    },
  });
}
```

### Query: getGuestPortalData
```typescript
export async function getGuestPortalData(userId: number) {
  // Step 1: Get user email
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  // Step 2: Find guest by email
  const [guest] = await db.select().from(guests).where(eq(guests.email, user.email)).limit(1);
  if (!guest) return null;

  // Step 3: Find active stay with all relations
  const stay = await db.query.stays.findFirst({
    where: and(eq(stays.guestId, guest.id), eq(stays.status, "checked_in")),
    with: {
      slip: true,
      amenityUsages: { orderBy: (au, { desc }) => [desc(au.createdAt)] },
      charges: { orderBy: (c, { asc }) => [asc(c.createdAt)] },
    },
  });

  return stay ? { guest, ...stay } : null;
}
```

### Server Action: logAmenity
```typescript
export async function logAmenity(input: AmenityInput): Promise<{ success: boolean; message: string }> {
  try {
    // Look up pricing
    const allPricing = await db.select().from(pricing);

    let unitPrice = 0;
    let totalAmount = 0;
    let quantity = 1;
    let description = "";
    let category = "amenity";
    let fuelType: "diesel" | "gas" | null = null;
    let shouldCharge = true;

    switch (input.type) {
      case "shower": {
        const [stay] = await db.select().from(stays).where(eq(stays.id, input.stayId)).limit(1);
        if (stay.showerTokensUsed < stay.showerTokens) {
          // Use included token
          await db.update(stays).set({ showerTokensUsed: stay.showerTokensUsed + 1 }).where(eq(stays.id, input.stayId));
          unitPrice = 0;
          totalAmount = 0;
          shouldCharge = false;
          description = "Shower (included token)";
        } else {
          const showerPricing = allPricing.find(p => p.name === "Shower Token");
          unitPrice = showerPricing?.rate ?? 300;
          totalAmount = unitPrice;
          description = "Shower token (paid)";
          // Still increment showerTokensUsed for tracking
          await db.update(stays).set({ showerTokensUsed: stay.showerTokensUsed + 1 }).where(eq(stays.id, input.stayId));
        }
        break;
      }
      case "fuel": {
        const fuelPricing = allPricing.find(p => p.name === (input.fuelType === "diesel" ? "Diesel" : "Gas"));
        unitPrice = fuelPricing?.rate ?? (input.fuelType === "diesel" ? 549 : 429);
        quantity = input.gallons;
        totalAmount = Math.round(unitPrice * quantity);
        fuelType = input.fuelType;
        category = "fuel";
        description = `${input.fuelType === "diesel" ? "Diesel" : "Gas"} fuel (${quantity} gal)`;
        break;
      }
      // ... shore_power, pump_out, laundry follow same pattern
    }

    // Insert amenity usage
    await db.insert(amenityUsage).values({
      stayId: input.stayId,
      type: input.type,
      quantity: String(quantity),
      unitPrice,
      totalAmount,
      fuelType,
    });

    // Insert charge (if applicable)
    if (shouldCharge && totalAmount > 0) {
      await db.insert(charges).values({
        stayId: input.stayId,
        description,
        category,
        amount: totalAmount,
      });
    }

    revalidatePath("/board");
    return { success: true, message: description };
  } catch (err) {
    return { success: false, message: "Failed to log amenity" };
  }
}
```

### Pricing Reference (from seed data)
```
Slip rates: Small $55/night (5500), Medium $85/night (8500), Large $125/night (12500)
Amenities: Shower Token $3 (300), Laundry Token $5 (500), Pump-out $15 (1500), Shore Power $12/day (1200)
Fuel: Diesel $5.49/gal (549), Gas $4.29/gal (429)
```

### Night Count Calculation
```typescript
import { differenceInCalendarDays } from "date-fns";

// For settlement display (NOT for charge calculation -- charges already exist)
const nights = differenceInCalendarDays(new Date(), new Date(stay.checkIn));
```

### Currency Formatting Helper
```typescript
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fetch in useEffect | Server Components + relational queries | Already established | Guest portal fetches data in RSC |
| Client-side modals | shadcn Dialog/Sheet (Radix primitives) | Already established | Use Sheet for slide-over, Dialog for settlement |
| Manual revalidation | revalidatePath server action pattern | Already established | Amenity log and settlement trigger board refresh |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual testing (no automated test framework installed) |
| Config file | none |
| Quick run command | `npm run build` (type-check + build) |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AMEN-01 | Shower logging creates usage record | manual | N/A | N/A |
| AMEN-02 | Fuel logging with gallons/type | manual | N/A | N/A |
| AMEN-03 | Shore power logging with kWh | manual | N/A | N/A |
| AMEN-04 | Pump-out single-tap logging | manual | N/A | N/A |
| AMEN-05 | Laundry single-tap logging | manual | N/A | N/A |
| AMEN-06 | Each amenity creates charge | manual | N/A | N/A |
| AMEN-07 | Guest card shows amenity badges | manual | Already implemented in guest-card.tsx | N/A |
| SETL-01 | Settlement panel opens for departing | manual | N/A | N/A |
| SETL-02 | Itemized charges displayed | manual | N/A | N/A |
| SETL-03 | Running total shown | manual | N/A | N/A |
| SETL-04 | Checkout releases slip | manual | N/A | N/A |
| SETL-05 | Stays archived with charges | manual | N/A | N/A |
| GUST-01 | Guest sees stay page | manual | N/A | N/A |
| GUST-02 | Credentials in large mono text | manual | N/A | N/A |
| GUST-03 | Charges with running total | manual | N/A | N/A |
| GUST-04 | Mobile-friendly portal | manual | N/A | N/A |
| DSGN-06 | guest-welcome.png header | manual | N/A | N/A |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build` + manual browser verification
- **Phase gate:** Build passes + all features verified in browser

### Wave 0 Gaps
- [ ] Install shadcn Sheet component: `npx shadcn@latest add sheet`
- [ ] Install shadcn Popover component: `npx shadcn@latest add popover`

## Open Questions

1. **Shower token included usage -- should it create an amenityUsage record?**
   - What we know: Seed data creates amenityUsage for all showers with unitPrice=300 and totalAmount=300, even for guests within their token allotment. The seed charges $3 per shower regardless.
   - What's unclear: Whether included-token showers should have $0 charges or $3 charges
   - Recommendation: Create amenityUsage record always (for tracking), but only create a $0 charge record for included tokens and $3 charge for paid ones. This matches the CONTEXT.md spec: "if tokens remaining, uses included token (no charge)."

2. **Shore power pricing: per-kWh or per-day?**
   - What we know: CONTEXT.md says "$0.12/kWh" but pricing table has "Shore Power" at 1200 cents/day. Seed data uses per-day pricing.
   - What's unclear: Whether to use per-kWh (from CONTEXT.md decisions) or per-day (from seed data)
   - Recommendation: Follow CONTEXT.md locked decision: prompt for kWh, calculate at $0.12/kWh. The pricing table rate of 1200 = $12/day is a separate concept. For the kWh input, use a unit price derived from the pricing or hardcoded at 12 cents/kWh.

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` -- complete schema with amenityUsage, charges, stays, pricing tables
- `src/db/seed.ts` -- data shape examples, pricing values, addAmenity helper pattern
- `src/app/board/actions.ts` -- established server action pattern
- `src/lib/queries.ts` -- Drizzle relational query patterns
- `src/lib/session.ts` -- SessionData interface (userId, role, name)
- `src/components/board/dispatch-board.tsx` -- placeholder handlers to wire
- `src/components/board/guest-card.tsx` -- amenity badge display already working
- `src/app/guest/layout.tsx` -- guest auth guard pattern

### Secondary (MEDIUM confidence)
- DESIGN-SPEC.md -- UI specs for guest detail, settlement, guest portal
- CONTEXT.md -- locked implementation decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed except Sheet/Popover
- Architecture: HIGH - follows established patterns from Phase 2
- Pitfalls: HIGH - directly observed in schema and seed data
- Queries: HIGH - Drizzle relational query pattern well-established

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- no external dependencies)
