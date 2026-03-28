# Pitfalls Research

**Domain:** Marina guest check-in and amenity tracking (dispatch board app)
**Researched:** 2026-03-28
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Amenity Usage Goes Unlogged Because Logging Is Too Slow

**What goes wrong:**
The entire point of HarborPass is capturing amenity revenue that currently leaks. If logging a shower use or fuel dispense takes more than one tap from the guest card, dock staff will skip it when busy. They are standing at the fuel pump or walking the docks, not sitting at a desk. Any friction -- opening a form, navigating to a page, filling in fields -- means they log it "later" (never). Industry data shows marinas lose an average of $47,000/year to untracked services.

**Why it happens:**
Developers model amenity logging as a CRUD form (create a new usage record with fields). The domain requires it to be a single-tap increment. Fuel is the exception (needs gallons + type), but even that should be a two-field quick input, not a full form.

**How to avoid:**
- Amenity logger is an icon grid directly on the guest card or guest detail panel
- Shower, pump-out, laundry: single tap increments a counter, shows a toast confirmation
- Fuel: tap opens a mini-form (gallons + diesel/gas toggle), not a full page
- Shore power: logged per-day automatically based on check-in/check-out dates, not manually
- Every amenity log writes immediately via server action -- no "save" button, no batch submission

**Warning signs:**
- Amenity logging requires navigating away from the board
- More than 2 taps to log a shower use
- No toast/confirmation feedback after logging
- Staff would need to remember to come back and log things later

**Phase to address:**
Phase 2 (Amenity Tracking) -- this is the core revenue-capture feature and must be designed for speed from the start

---

### Pitfall 2: Slip Assignment Ignores Real-World Vessel Fitting Complexity

**What goes wrong:**
A naive slip assignment just checks if vessel LOA <= slip max length. But boats also have beam (width) and draft (depth), and a 38-foot sailboat with a 6-foot keel draws very differently than a 38-foot powerboat. If the system shows a slip as "available" but the boat physically cannot fit (too wide, water too shallow), staff lose trust in the system immediately and go back to the whiteboard.

**Why it happens:**
Developers treat slips as one-dimensional (length only). Marina slips have three key constraints: max LOA, max beam, and water depth at the slip. Walk-up boaters tell staff their vessel dimensions and expect an instant answer about where to go.

**How to avoid:**
- Slip schema stores max_loa, max_beam, and water_depth
- Vessel check-in captures LOA, beam, and draft
- Slip filtering in the assignment grid grays out slips where ANY dimension does not fit, with a tooltip explaining why ("Draft too deep" or "Too wide")
- Never auto-assign -- always show the visual grid and let staff choose, because staff know things the system does not (e.g., "T-7 has a piling issue right now")
- Add a small buffer/margin concept (do not show a 30-foot slip as available for a 29.9-foot boat)

**Warning signs:**
- Slip table only has a `length` or `size` column
- No beam or draft fields in vessel check-in form
- All slips appear available regardless of vessel dimensions
- Assignment is a dropdown list instead of a visual grid

**Phase to address:**
Phase 1 (Schema + Check-In Flow) -- dimensions must be in the schema from day one, not retrofitted

---

### Pitfall 3: Check-In Wizard Feels Like a Data Entry Form Instead of a Dispatch Action

**What goes wrong:**
The check-in flow becomes a long multi-field form that takes 3+ minutes to complete. Staff abandon it and go back to writing on the whiteboard. The brief explicitly says "under 60 seconds" and "not like filling out a long form." Every field that is not strictly necessary for assigning a slip and generating credentials is a field that slows down the line of boaters waiting at the dock office.

**Why it happens:**
Developers add every conceivable guest field to the check-in form: emergency contact, insurance info, vessel registration, home port, number of passengers, pets aboard, etc. These are nice-to-have data but they kill check-in speed. The check-in is a dispatch action, not a guest profile form.

**How to avoid:**
- Step 1 collects ONLY: guest name, vessel name, LOA, beam, draft, phone or email. That is it. Six fields.
- Step 2 is visual slip selection (tap, not type)
- Step 3 is confirmation + auto-generated credentials (gate code, Wi-Fi, shower tokens)
- Total interaction: 3 screens, under 60 seconds
- Additional guest data (home port, registration, notes) can be added AFTER check-in from the guest detail panel -- never block the check-in flow
- Pre-booked guests should have Step 1 pre-filled, making check-in a confirm-and-assign operation

**Warning signs:**
- Check-in form has more than 8 fields on any single step
- Required fields include anything beyond name/vessel/dimensions/contact
- Check-in takes more than 3 clicks to complete for a pre-booked guest
- No pre-fill for pre-booked arrivals

**Phase to address:**
Phase 1 (Check-In Flow) -- the wizard is the core UX and must be designed lean from the start

---

### Pitfall 4: Credential Generation Creates Security or Usability Problems

**What goes wrong:**
Gate codes, Wi-Fi passwords, and shower tokens are the deliverables of check-in. Two failure modes: (1) codes are not unique per guest, so revoking one guest's access means changing everyone's code, or (2) codes are generated client-side and are predictable/sequential, or (3) codes are hard to read aloud over the radio (ambiguous characters, too long).

**Why it happens:**
Credentials feel like a minor detail compared to the check-in flow, so they get a simple `Math.random()` implementation. But dock staff literally read gate codes aloud over VHF radio to boaters. "Your gate code is zero-one-oh-one-one-zero" is a nightmare. And if all guests share one gate code, there is no way to track who entered when.

**How to avoid:**
- Gate codes: 6-digit numeric, avoiding ambiguous patterns (no 000000, no sequential like 123456, no repeated digits like 111111). Generate server-side, store per-guest, verify uniqueness among active guests
- Wi-Fi passwords: "harbor-lastname-NNNN" format as specified in the brief. Lowercase, no ambiguous characters. The format is designed to be easy to read aloud
- Shower tokens: integer count, not codes. Guest gets N tokens included with their stay, can purchase more
- All credentials displayed in monospace font for clarity
- Copy-to-clipboard buttons on credential displays (staff copies gate code to paste into a radio message or text)

**Warning signs:**
- All guests get the same gate code
- Credentials generated on the client side
- Gate codes contain letters or special characters
- No copy button on credential displays
- Credentials not shown in monospace

**Phase to address:**
Phase 1 (Check-In Flow, Step 3) -- credentials are generated at check-in completion

---

### Pitfall 5: Settlement/Checkout Misses Charges or Double-Counts

**What goes wrong:**
When a guest departs, staff need an accurate itemized bill. If amenity charges are calculated on-the-fly from raw usage logs, there are edge cases: shore power charged for arrival day but not departure day? Fuel logged twice because staff tapped the button and thought it did not register? Shower tokens included in the nightly rate counted separately as charges? The guest disputes the bill, staff cannot explain it, trust in the system evaporates.

**Why it happens:**
Charges accumulate from multiple sources (nightly rate, fuel logs, token usage, power metering) and the settlement view needs to reconcile all of them into one coherent bill. Without clear line-item attribution and a running total visible throughout the stay, discrepancies appear at checkout.

**How to avoid:**
- Each amenity log creates an immutable charge record with timestamp, type, quantity, unit price, and total
- Nightly slip rate charges are generated per-night (not calculated as nights x rate at checkout) so partial stays and rate changes are handled
- Shower/laundry tokens: included tokens do not generate charges. Only purchased tokens and tokens beyond the included count generate charges
- Shore power: daily usage records, charged per kWh with clear date attribution
- Settlement panel shows itemized list grouped by category with subtotals
- Running charges visible on the guest detail card throughout the stay (not just at checkout)
- Toast confirmation on each amenity log prevents "did it register?" double-taps

**Warning signs:**
- Charges calculated only at checkout time rather than logged incrementally
- No way for staff to see running total during a guest's stay
- Included amenities (e.g., 3 shower tokens) appear as charges
- No timestamps on charge line items

**Phase to address:**
Phase 2 (Amenity Tracking) for charge creation, Phase 3 (Settlement/Checkout) for reconciliation

---

### Pitfall 6: The Board Becomes a Dashboard Instead of a Dispatch Tool

**What goes wrong:**
The three-column board (Arriving, Checked In, Departing) degrades into a generic dashboard with stat cards, charts, and data tables. Staff open the app and see "12 guests checked in" as a big number but cannot immediately act on anything. The design spec explicitly warns against stat cards at the top and tab-heavy interfaces.

**Why it happens:**
Dashboard patterns are the default muscle memory for developers building internal tools. "Show some KPI cards at the top, then a table below" is the path of least resistance. But this is a dispatch board -- the UI should answer "what do I need to do next?" not "how are we doing this month?"

**How to avoid:**
- The board is three columns of actionable guest cards, not metrics
- Column headers show count only (e.g., "Arriving Today (3)"), not KPI-style stat cards
- Every card has a primary action button (Check In / View Stay / Settle)
- The dock strip is a spatial map, not a data visualization
- Manager analytics is a completely separate view (role-based routing), never mixed into the staff board
- No tabs, no sidebar, no breadcrumbs on the staff board

**Warning signs:**
- Large number cards or KPI widgets on the staff home page
- Sidebar navigation on the board view
- Guest data shown in table rows instead of cards
- Manager metrics visible on the staff board
- Tabs to switch between "Board" and "Analytics" on the same page

**Phase to address:**
Phase 1 (Board Layout) -- the layout paradigm must be established correctly from the first render

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded pricing in seed data only | Faster initial build | Cannot change rates without reseeding | MVP only -- manager pricing config should be Phase 3 |
| Single shared gate code for all guests | Simpler credential logic | No per-guest access control, cannot revoke one guest | Never -- per-guest codes from day one |
| Shore power as flat daily fee instead of metered kWh | Avoids daily metering records | Unfair billing, disputes from low-usage guests | Acceptable for MVP, metered in Phase 2 |
| No guest history (only current stays) | Simpler schema, no archival | Cannot identify repeat visitors, no VIP treatment | MVP only -- guest history should be Phase 3 |
| Client-side date math for stay duration | Quick to implement | Timezone bugs, off-by-one errors on night counts | Never -- server-side date calculations from day one |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Neon Postgres (serverless) | Using persistent connections that exhaust connection pool | Use `@neondatabase/serverless` with HTTP mode for Vercel serverless functions; connection pooling enabled |
| Drizzle ORM with Neon | Using node-postgres driver instead of Neon serverless driver | Use `drizzle-orm/neon-http` adapter for serverless compatibility |
| Next.js Server Actions | Not revalidating paths after mutations | Call `revalidatePath()` after every write operation so the board reflects changes immediately |
| Session auth on Vercel | Cookie configuration differs between dev (localhost HTTP) and prod (HTTPS) | Configure Secure cookies conditionally based on environment; set SameSite=Lax |
| Drizzle schema migrations | Running `drizzle-kit push` in production without reviewing changes | Use `drizzle-kit generate` to create migration files, review them, then apply with `drizzle-kit migrate` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all guest history on board render | Board takes 2+ seconds to load | Board query fetches only active stays (checked_in or arriving today or departing today); history is a separate manager query | 100+ historical guest records |
| No index on slip status or stay dates | Slip availability check slows as records grow | Add composite index on stays(slip_id, check_out_date) and slips(status) | 500+ stay records |
| Fetching full amenity log for every guest card | Board render queries explode (N+1) | Aggregate amenity counts in a summary field or use a single joined query with GROUP BY | 20+ guests with 10+ amenity entries each |
| Real-time board without efficient refresh | Polling every second hammers the database | Use `revalidatePath` on mutations + periodic revalidation (30-60s ISR), not websockets or constant polling | Multiple concurrent staff users |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Guest portal exposes other guests' data | Privacy violation, slip assignments and names visible to other boaters | Guest route fetches only the authenticated guest's stay; server-side filtering, never client-side |
| Gate codes visible in URL parameters | Codes leaked via browser history or shared links | Credentials fetched via authenticated API call, never in URLs or query params |
| Staff actions accessible without role check | Guest user could trigger check-ins or log amenities | Middleware enforces role on every server action and API route; check role in the action, not just the layout |
| Demo credentials left in production | Anyone can log in as staff or manager | Seed script only runs in development/preview; production requires real credential setup |
| Amenity logging has no rate limiting | Malicious or accidental rapid taps create hundreds of charge records | Debounce on client (300ms), dedup check on server (same amenity + same guest within 30 seconds = reject) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Check-in wizard loses state on accidental dismiss | Staff re-enters all guest data from scratch, boater waits longer | Confirm dialog on dismiss if data has been entered; wizard state persists in React state (not URL) |
| Dock strip slips too small to tap on mobile/tablet | Staff on the dock with a tablet cannot use the spatial map | Minimum 40px touch targets on dock strip blocks; pinch-to-zoom on mobile |
| No visual differentiation between arriving and walk-up guests | Staff cannot prioritize pre-booked arrivals who have been waiting | Pre-booked cards show a "Reserved" badge and are sorted to the top of the Arriving column |
| Settlement panel has no print/export | Staff cannot hand the guest a receipt or email it | Include a "Print Receipt" button that opens a clean print-formatted view |
| Board does not show expected departure dates for checked-in guests | Staff cannot see who is overstaying or when slips free up | Checked-in guest cards show "Departs: Mar 29" clearly; overdue guests get a coral highlight |
| Amenity toast confirmation disappears too fast | Staff unsure if the tap registered, taps again, double-charges | Toast stays for 2 seconds minimum; disable the amenity button during server action pending state |

## "Looks Done But Isn't" Checklist

- [ ] **Check-in flow:** Pre-booked guests pre-fill fields -- verify pre-fill actually works with seeded pre-booked data
- [ ] **Slip assignment:** Slips that do not fit the vessel are grayed out -- verify with a large vessel that should eliminate most slips
- [ ] **Credential generation:** Gate codes are unique among currently active guests -- verify no duplicates in seed data
- [ ] **Guest portal:** Guest can ONLY see their own stay -- verify by logging in as guest and checking API responses contain no other guest data
- [ ] **Settlement:** Included shower tokens are NOT double-counted as charges -- verify by checking out a guest who used only included tokens
- [ ] **Departing column:** Guests whose checkout date is today appear here -- verify with the demo data date (busy Friday scenario)
- [ ] **Dock strip:** Slip colors update immediately after check-in -- verify the strip reflects the new occupancy without a page refresh
- [ ] **Role routing:** Staff cannot access manager analytics; guest cannot access the board -- verify with each demo account
- [ ] **Shore power:** Daily kWh charges have correct date attribution -- verify a 3-night stay shows 3 separate power entries
- [ ] **Search:** Global search finds guests by name AND vessel name -- verify both paths work

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Slip schema missing beam/draft | MEDIUM | Add columns, migrate, update check-in wizard and assignment grid. Data loss: none if caught before real usage |
| Amenity logger too slow to use | LOW | Refactor to icon-grid with server actions. UI-only change, schema stays the same |
| Check-in wizard too many fields | LOW | Move non-essential fields to guest detail edit. Wizard shrinks, no data loss |
| Shared gate codes (not per-guest) | HIGH | Schema change (add credential columns per stay), regenerate codes for all active guests, update guest portal. Disruptive |
| Charges calculated only at checkout | HIGH | Requires adding charge records table, backfilling from usage logs (lossy), restructuring settlement view |
| Dashboard layout instead of dispatch board | MEDIUM | Layout rewrite but business logic unchanged. Costly in time but not in data |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Slip dimensions incomplete | Phase 1: Schema + Check-In | Slip table has max_loa, max_beam, water_depth columns; check-in collects all three vessel dimensions |
| Check-in too slow | Phase 1: Check-In Wizard | Time a check-in with a stopwatch: pre-booked < 30s, walk-up < 60s |
| Board becomes dashboard | Phase 1: Board Layout | No stat cards, no sidebar, no tabs on staff view; three columns of actionable cards |
| Amenity logging friction | Phase 2: Amenity Tracking | Single tap logs shower/pump-out; fuel is 2-field quick input; toast confirms |
| Credential problems | Phase 1: Check-In Flow | Gate codes are 6-digit, unique, per-guest; Wi-Fi follows format; displayed in monospace with copy button |
| Settlement misses charges | Phase 3: Checkout | Itemized bill matches sum of logged amenities + nightly rates; included tokens excluded from charges |
| Guest data leaks to other guests | Phase 1: Auth + Role Routing | Guest API responses contain zero data about other guests; tested with guest demo account |
| Neon connection pool exhaustion | Phase 1: Database Setup | Using @neondatabase/serverless HTTP driver, not pg pool |

## Sources

- [DockMaster: Prevent Revenue Leakage](https://www.dockmaster.com/blog/prevent-revenue-leakage) -- marina revenue leakage patterns and prevention
- [Harba: Hidden Costs of Spreadsheet Dependency](https://harba.co/blog/marina-management-study-reveals-the-hidden-costs-of-spreadsheet-dependency-in-2025) -- $47K/year average loss from manual systems
- [Marina Dock Age: Simplifying Slip Management](https://www.marinadockage.com/simplifying-slip-management/) -- slip assignment complexity beyond simple length matching
- [Slipify: Spatial Marina Mapping](https://www.slipifymarinas.com/) -- spatial awareness in marina software
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) -- session management patterns for App Router
- [WorkOS: Next.js Auth Guide 2026](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) -- role-based auth pitfalls
- [Clerk: NextAuth Persistence Issues](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues) -- cookie configuration problems
- [Drizzle ORM + Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) -- correct driver configuration for serverless

---
*Pitfalls research for: Marina guest check-in and amenity tracking (HarborPass)*
*Researched: 2026-03-28*
