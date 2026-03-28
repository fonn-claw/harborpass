# HarborPass Design Specification

## UI Paradigm: Dispatch Board

HarborPass is a **dispatch board** — like an airport gate agent's screen or a restaurant host stand. It is NOT a dashboard, NOT an admin panel. The primary view is a live status board showing today's guest flow: who's arriving, who's here, who's leaving. Everything is organized by **action needed**, not by data category.

The closest real-world analogy: a hotel front desk screen. The staff member looks at it and immediately knows what needs doing next. The board answers one question: "What do I need to handle right now?"

## Primary Interaction

**Process an arrival.** The dock staff member's most common action is checking in a boater. This must take under 60 seconds on screen — vessel info, slip assignment (with visual fit-matching), credential generation, done. The check-in flow is a focused wizard overlay that takes over the screen, not a form buried in a sidebar.

Secondary interactions: logging amenity usage (quick-tap from a guest card), processing departures (review charges, settle, release slip).

## Layout Structure

**Full-width board with floating action bar.**

```
+------------------------------------------------------------------+
|  [Logo]  Sunset Harbor Marina          [Search] [+ Check In] [U] |
+------------------------------------------------------------------+
|                                                                  |
|  DOCK STRIP (visual slip map — colored by status)                |
|  [T1][T2][T3][--][T5][T6][--][--][T9][T10]...                  |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  ARRIVING TODAY (3)    |  CHECKED IN (12)    |  DEPARTING (2)    |
|                        |                     |                    |
|  [Guest Card]          |  [Guest Card]       |  [Guest Card]     |
|  [Guest Card]          |  [Guest Card]       |  [Guest Card]     |
|  [Guest Card]          |  [Guest Card]       |                    |
|                        |  [Guest Card]       |                    |
|                        |  ...                |                    |
|                        |                     |                    |
+------------------------------------------------------------------+
```

- **Top bar**: Logo, marina name, global search, primary "Check In" CTA, user menu. No sidebar. No hamburger.
- **Dock strip**: A horizontal visual map of transient slips. Each slip is a small block, color-coded: available (green), occupied (blue), departing today (amber), maintenance (gray). Tapping a slip opens its detail. This gives instant spatial awareness.
- **Board columns**: Three swim lanes — Arriving Today, Checked In, Departing Today. Each guest is a card showing name, vessel, slip, and quick-action buttons. Cards are drag-enabled for reassignment.
- **Manager view**: Replaces the board with analytics panels (occupancy chart, revenue breakdown, pricing config). Accessed via role-based routing, not a tab.
- **Guest view**: Simple single-column "My Stay" page — slip info, credentials, charges. No board, no complexity.

## Anti-patterns for This App

- **Sidebar navigation** — wastes horizontal space needed for the three-column board. Navigation is minimal (staff only need the board + maybe a guest lookup).
- **Data tables for slip availability** — a table of slip dimensions is the wrong affordance. The dock strip provides instant visual scanning; detail comes on hover/tap.
- **Stat cards at the top** — "12 Guests Checked In" as a big number card is pointless when you can see the 12 cards below. The column header count is sufficient.
- **Multi-page check-in form** — the check-in must be a streamlined wizard overlay, not a series of page navigations. Context-switching kills speed.
- **Generic SaaS chrome** — breadcrumbs, footer links, "Getting Started" banners. This is a workstation tool, not a marketing site.
- **Tab-heavy interfaces** — staff shouldn't have to remember which tab they need. The board shows everything relevant to today in one view.

---

## Design System

### Colors

| Role | Hex | Usage |
|------|-----|-------|
| **Navy** (Primary) | `#0F2B46` | Top bar, headings, primary text |
| **Ocean** (Interactive) | `#1B6FA8` | Buttons, links, selected states, dock strip occupied |
| **Teal** (Accent) | `#0D9488` | Available slips, success states, check-in CTA |
| **Sand** (Surface) | `#F5F0E8` | Page background, card backgrounds |
| **White** (Card) | `#FFFFFF` | Card surfaces, inputs, modals |
| **Rope** (Warm accent) | `#C4883A` | Departing/amber status, warnings |
| **Coral** (Danger) | `#DC4A3F` | Overdue, errors, urgent badges |
| **Slate** (Muted) | `#64748B` | Secondary text, borders, disabled |
| **Fog** (Subtle) | `#E2E8F0` | Dividers, dock strip empty slots |

**Reasoning**: Navy and ocean evoke water without being cartoonish. Sand grounds it in the marina environment (dock wood, rope, sun). Teal signals availability and action — it pops against navy. The palette avoids the "generic blue SaaS" trap by using warm sand as the background instead of cool gray.

### Typography

- **Headings**: DM Sans (600, 700) — geometric, modern, reads well at all sizes. Has the right balance of friendly and professional for a workstation app.
- **Body**: Inter (400, 500) — proven readability for data-dense UIs. Used for card content, form labels, secondary text.
- **Mono**: JetBrains Mono (400) — for gate codes, Wi-Fi passwords, slip numbers. Makes credentials feel distinct and easy to read aloud.

### Key Components

**Guest Card** — The primary UI element. Appears in all three board columns.
```
+------------------------------------------+
|  [Boat Icon]  "Sea Breeze"    Slip T-7   |
|  John Smith    38' Catalina              |
|  Arriving 2:30 PM                        |
|  [Shower: 2] [Fuel] [Wi-Fi]   [Check In] |
+------------------------------------------+
```
- White card on sand background, 1px `#E2E8F0` border, 8px border-radius
- Left color stripe (4px) indicates status: teal=arriving, ocean=checked-in, rope=departing
- Amenity badges: small pill-shaped indicators showing what's been used
- Primary action button in the bottom-right corner (context-dependent: "Check In", "View Stay", "Settle")
- Compact: ~120px tall. Must fit 5+ cards visible per column without scrolling

**Dock Strip** — Horizontal visual slip map.
- Fixed row of rectangular blocks (40px wide x 28px tall each), with 4px gap
- Each block shows slip number (small text, centered)
- Color-coded: Teal border/light fill = available, Ocean fill = occupied, Rope fill = departing today, Fog fill = not-in-use/maintenance
- Hover shows tooltip: "T-7: Sea Breeze (38' Catalina) — Departs Mar 29"
- Click opens guest detail or starts check-in (if available)
- Horizontally scrollable if many slips, with subtle overflow indicators

**Check-In Wizard** — Modal overlay, 3 steps.
- Step 1: Guest & Vessel — name, vessel name, LOA/beam/draft, contact. Pre-filled if pre-booked.
- Step 2: Slip Assignment — shows only slips that fit the vessel dimensions. Visual grid (not a dropdown). Available slips highlighted in teal, with dimension labels. Tap to select.
- Step 3: Confirm & Credentials — summary card + auto-generated gate code, Wi-Fi password, shower tokens. One-click "Complete Check-In" button.
- Progress indicator: three dots at top, not a numbered step list
- Smooth slide-left transition between steps
- Can be dismissed (X button) — confirmation if data entered

**Amenity Logger** — Quick-tap from guest card or guest detail.
- Expandable tray at the bottom of a guest detail view
- Icon grid: Shower, Fuel, Power, Pump-out, Laundry, Wi-Fi
- Tap icon to log usage — most just increment a counter, Fuel opens a quick input (gallons + type)
- Each tap shows a brief "Logged" toast confirmation

**Settlement Panel** — For departures.
- Slide-over panel from the right (480px wide)
- Itemized charge list: nightly rate x nights, fuel charges, shower tokens, power usage
- Running total at bottom
- "Settle & Release Slip" primary button
- Print/email receipt option

### Motion

1. **Check-in completion cascade**: When a guest is checked in, their card slides from the "Arriving" column to "Checked In" with a smooth 300ms ease-out transition. The dock strip slot simultaneously fills with ocean blue. This single animation connects the action to the spatial model.

2. **Dock strip pulse**: When a new walk-up arrival is being processed, the selected slip gently pulses (opacity 0.6 to 1.0, 1.5s cycle) in teal to show "this one is being assigned." Stops when check-in completes.

---

## Screens

### 1. The Board (Staff Home)

**What the user sees first**: The full dispatch board — dock strip across the top showing 20 transient slips at a glance, three columns below. The eye goes to the leftmost column first: "Arriving Today (3)" with three guest cards waiting for action. A prominent teal "Check In" button sits in the top bar.

**What they interact with most**: Guest cards. Clicking a card in "Arriving" opens the check-in wizard. Clicking a card in "Checked In" opens the guest detail (with amenity logger). Clicking a card in "Departing" opens the settlement panel. The dock strip is a secondary interaction — a quick way to answer "what's in slip T-4?" without scanning the board.

**What makes it different**: There's no navigation to learn. No menus, no tabs, no settings page to find. The entire job is on one screen. The dock strip gives spatial context that no table or list could — staff can point at a slip on the screen the same way they'd point at one on the actual dock. The three columns mirror the workflow, not the data model.

### 2. Check-In Wizard (Modal Overlay)

**What the user sees first**: A clean, focused overlay on top of the dimmed board. Step 1: Guest & Vessel info. If the guest pre-booked, fields are pre-populated and highlighted — staff just confirms and clicks "Next." For walk-ups, it's a short form: name, vessel name, LOA, beam, draft, phone or email.

**What they interact with most**: Step 2 — the slip assignment grid. This is the moment that matters. Available slips are shown as visual blocks (like the dock strip but larger), each labeled with max dimensions. Slips too small for the vessel are grayed out with a subtle "Too small" label. The staff taps the right slip, sees it highlight, and moves to confirmation.

**What makes it different**: The slip selection is visual and physical, not a dropdown. It mirrors how staff think — "put the 38-footer in T-7, it'll fit." Dimension filtering happens automatically. The whole flow is 3 taps (confirm info → pick slip → complete), not 15 form fields across 4 pages.

### 3. Guest Detail (Slide-Over or Expanded Card)

**What the user sees first**: A panel showing everything about a current guest's stay. Top section: guest name, vessel, slip assignment, check-in date, expected departure. Middle: credentials block — gate code, Wi-Fi password, shower tokens remaining — with copy buttons. Bottom: amenity usage log and running charges.

**What they interact with most**: The amenity logger icons (quick-tap to log shower use, fuel, etc.) and the credentials section (copying a gate code to tell a boater over the radio). For departing guests, the "Settle Account" button is prominent at the bottom.

**What makes it different**: Credentials are front-and-center, not buried in a profile page. The staff member can glance at this panel and immediately read the gate code aloud. Amenity logging is one tap, not a form — because dock staff are standing at the fuel pump, not sitting at a desk.

### 4. Login Screen

**What the user sees first**: A full-bleed atmospheric marina photograph (warm golden hour, boats at dock, calm water). The login card floats centered on top — white card with subtle shadow, HarborPass logo, email/password fields, sign-in button. Simple and inviting.

**What makes it different**: The marina photo immediately communicates what this app is about. No generic gradient background. The photo is warm and golden, not cold corporate blue.

### 5. Guest Portal (Boater View)

**What the user sees first**: A single-column mobile-friendly page. Top: "Welcome to Sunset Harbor Marina" with their name. Then a credentials card (gate code in large mono text, Wi-Fi password, shower tokens). Then a charges summary. Simple, no navigation needed.

**What makes it different**: This isn't a dashboard — it's a reference card. The boater pulls it up on their phone to check the gate code or see what they owe. Large text, high contrast, zero learning curve.

---

## Asset Manifest

### Tier 1 — Functional SVGs

All icons use viewBox="0 0 24 24", stroke-width="2", stroke-linecap="round", stroke-linejoin="round", fill="none". Stroke color is `currentColor` for theme flexibility.

| Filename | Dimensions | Usage |
|----------|-----------|-------|
| `logo.svg` | 200x48 | Top bar brand mark, login screen |
| `logo-icon.svg` | 32x32 | Favicon, compact brand mark |
| `icon-check-in.svg` | 24x24 | Check-in action buttons, arriving column |
| `icon-check-out.svg` | 24x24 | Check-out/departure action buttons |
| `icon-boat.svg` | 24x24 | Guest cards, vessel info |
| `icon-slip.svg` | 24x24 | Slip assignment, dock references |
| `icon-shower.svg` | 24x24 | Amenity logger, usage badges |
| `icon-fuel.svg` | 24x24 | Amenity logger, fuel charges |
| `icon-power.svg` | 24x24 | Amenity logger, shore power |
| `icon-pump-out.svg` | 24x24 | Amenity logger, pump-out tracking |
| `icon-wifi.svg` | 24x24 | Credentials section, Wi-Fi info |
| `icon-gate.svg` | 24x24 | Credentials section, gate access |
| `icon-laundry.svg` | 24x24 | Amenity logger, laundry tokens |
| `icon-guest.svg` | 24x24 | Guest references, user menu |
| `icon-search.svg` | 24x24 | Global search in top bar |
| `icon-settings.svg` | 24x24 | Manager settings, pricing config |
| `icon-chart.svg` | 24x24 | Manager analytics view |
| `icon-calendar.svg` | 24x24 | Date references, stay duration |
| `icon-receipt.svg` | 24x24 | Settlement panel, charges |
| `icon-token.svg` | 24x24 | Shower/laundry tokens |
| `empty-board.svg` | 240x160 | Empty state: no guests for today |
| `empty-search.svg` | 240x160 | Empty state: no search results |

### Tier 2 — Decorative (DALL-E)

| Filename | Dimensions | Usage |
|----------|-----------|-------|
| `hero-marina.png` | 1024x1024 | Login screen background |
| `guest-welcome.png` | 1024x1024 | Guest portal header illustration |
