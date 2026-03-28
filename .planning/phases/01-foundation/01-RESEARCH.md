# Phase 1: Foundation - Research

**Researched:** 2026-03-28
**Domain:** Next.js scaffolding, Drizzle/Neon schema, iron-session auth, seed data, design system
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire project foundation: Next.js 15 App Router with Tailwind v4, Drizzle ORM connected to Neon Postgres, iron-session cookie auth with role-based routing, a comprehensive seed data set for Sunset Harbor Marina, and the design system (colors, typography, layout shell). The phase delivers three working demo accounts that can log in and reach role-appropriate placeholder pages, with a fully populated database ready for subsequent phases.

The critical insight is that this phase sets patterns every future phase depends on. The Drizzle schema must include all tables needed for seed data (slips, stays, guests, amenity usage, charges, pricing), not just the tables Phase 1 "uses." The design system must establish the dispatch board layout from day one -- no sidebar, no tabs, no dashboard drift. The login screen is the first visual impression and must use the hero-marina.png background with the design spec's warm palette.

**Primary recommendation:** Build the complete schema upfront (all tables for all phases), seed comprehensively, and prove the auth + design system end-to-end with placeholder pages that already use the correct layout structure.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Login screen: full-bleed hero-marina.png background, centered floating white card, HarborPass logo, email/password fields, demo account hints below form, design spec colors
- Seed data: realistic American names, real boat models (Catalina, Beneteau, Boston Whaler), 20 transient slips (T-1 to T-20) with small/medium/large sizing, 12 occupied, 3 arriving today (1 pre-booked, 2 walk-ups), 2 departing with charges, 1 repeat visitor, 2 months history, amenity usage, pricing config
- Design system: shadcn/ui with design spec palette, Tailwind v4 with custom theme tokens, Google Fonts via next/font (DM Sans 600/700, Inter 400/500, JetBrains Mono 400), SVG icons from public/assets/, layout shell with full-width top bar (logo + marina name + action area), no sidebar, no tabs, sand background, navy top bar
- Authentication: iron-session for cookies, bcrypt for password hashing, middleware redirects by role (staff->board, manager->manager, guest->guest), login/logout server actions, persistent cookie
- Role placeholder pages: staff board placeholder ("Dispatch Board -- Phase 2"), manager placeholder ("Analytics -- Phase 4"), guest placeholder ("Guest Portal -- Phase 3"), all using correct layout and design system

### Claude's Discretion
- Exact Drizzle schema column types and constraints
- Database migration strategy
- Middleware implementation pattern (Next.js middleware vs server-side checks)
- Seed script execution approach (npm script vs migration)
- Error handling on login failures

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password | iron-session 8.x + bcryptjs, server action for login, session cookie creation |
| AUTH-02 | User session persists across browser refresh | iron-session encrypted cookie with httpOnly + secure flags, persistent (not session) cookie |
| AUTH-03 | User can log out from any page | Server action that destroys session, redirect to /login, logout button in top bar |
| AUTH-04 | Role-based routing after login | Next.js middleware checks cookie presence, server-side session checks for role routing |
| SLIP-01 | 20 transient slips with dimensions | Schema: slips table with max_loa, max_beam, water_depth columns; seed T-1 to T-20 |
| SLIP-02 | Slip status tracking | Schema: slip status enum (available, occupied, departing_today, maintenance) |
| SLIP-04 | One active stay per slip | Schema: unique constraint on stays(slip_id) where status is active, enforced in queries |
| DEMO-01 | Seed Sunset Harbor Marina with 20 transient slips | Seed script with 3 size categories: small (30ft), medium (40ft), large (55ft) |
| DEMO-02 | Seed 12 occupied, 3 arriving, 2 departing | Seed script with relative dates anchored to current date |
| DEMO-03 | Seed 3 demo accounts | staff/manager/guest accounts with bcrypt-hashed "demo1234" passwords |
| DEMO-04 | Seed amenity usage and 2-month history | Historical stays, amenity_usage records, charge records across current guests |
| DEMO-05 | Seed 1 repeat visitor | Guest with a completed stay ~4 weeks ago plus a current active stay |
| DSGN-01 | Dispatch board paradigm | Layout shell: full-width top bar, no sidebar, no tabs, no stat cards |
| DSGN-02 | Design spec color palette | Tailwind v4 @theme with navy, ocean, teal, sand, white, rope, coral, slate, fog |
| DSGN-03 | Typography: DM Sans, Inter, JetBrains Mono | next/font/google loading with correct weights, CSS variable assignment |
| DSGN-04 | SVG/PNG assets used as documented | 24 assets in public/assets/ integrated into layout and login |
| DSGN-05 | Login screen with hero-marina.png background | Full-bleed background image, centered white card, design spec styling |
| DSGN-07 | Responsive design | Tailwind responsive utilities, mobile-friendly layout shell |
</phase_requirements>

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.14 | Full-stack React framework | Latest stable 15.x. 16.x exists but STACK.md flags latency regressions. 15.5.14 proven on Vercel. |
| React | 19.x | UI library | Ships with Next.js 15. Server Components + Server Actions used throughout. |
| TypeScript | 5.x | Type safety | Required for Drizzle type inference. Ships with create-next-app. |
| Tailwind CSS | 4.x (4.2.2) | Utility-first CSS | v4 uses @theme directive in CSS, no config file. Design spec colors map to CSS variables. |
| Drizzle ORM | 0.45.2 | Type-safe SQL | Specified by brief. Schema-as-code, excellent TS inference, neon-http adapter. |
| drizzle-kit | 0.31.10 | Migrations CLI | Companion to drizzle-orm. `drizzle-kit push` for dev, `drizzle-kit migrate` for production. |
| @neondatabase/serverless | 1.0.2 | Neon HTTP driver | Required for Drizzle neon-http adapter. HTTP mode for serverless, no TCP connections. |
| iron-session | 8.0.4 | Cookie sessions | Lightweight encrypted cookie sessions. No session table, no OAuth complexity. |
| bcryptjs | 3.0.3 | Password hashing | Pure JS, works in all Next.js runtimes including Edge. No native deps. |
| shadcn/ui | latest (copy-paste) | Component primitives | Card, Button, Input, Dialog, Sheet, Badge, Tooltip, Sonner. Built on Radix. |

### Supporting (install now, used in later phases)

| Library | Version | Purpose | When Used |
|---------|---------|---------|-----------|
| Zod | 3.25.76 | Schema validation | Phase 2+ for form validation. Install now for login validation. Use 3.x not 4.x. |
| react-hook-form | 7.72.0 | Form state management | Phase 2 check-in wizard. Not needed Phase 1. |
| @hookform/resolvers | 5.2.2 | Zod-to-RHF bridge | Phase 2 with react-hook-form. |
| date-fns | 4.1.0 | Date math | Phase 1 seed script (relative dates), Phase 2+ stay duration. |
| sonner | 2.0.7 | Toast notifications | Phase 2+ for amenity logging confirmations. shadcn wraps it. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| iron-session | Auth.js (NextAuth v5) | Overkill for credential-only demo; Edge runtime issues; STACK.md explicitly rejects |
| bcryptjs | bcrypt (native) | Fails in Edge middleware; requires node-gyp; no benefit for demo |
| Zod 3.x | Zod 4.x (4.3.6) | Zod 4 is stable now but 3.x is proven safe choice per STACK.md guidance |
| Next.js 15.5.14 | Next.js 16.2.1 | 16.x has reported latency regressions (GitHub #85470); 15.x is battle-tested |

**Installation:**
```bash
# Create Next.js app (use 15.x explicitly)
npx create-next-app@15 harborpass --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install iron-session bcryptjs
npm install -D @types/bcryptjs

# Validation (for login, seed script)
npm install zod

# Date utilities (for seed script relative dates)
npm install date-fns

# UI (shadcn adds its own dependencies including Radix, cva, clsx, tailwind-merge)
npx shadcn@latest init
npx shadcn@latest add button card input badge sonner

# Form handling (install now, used Phase 2+)
npm install react-hook-form @hookform/resolvers
```

**Note:** `npx create-next-app@15` pins to the 15.x line. Verify with `npx next --version` after install.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx            # Root layout: fonts, theme provider, Toaster
│   ├── page.tsx              # Redirect to /login or role-appropriate page
│   ├── login/
│   │   └── page.tsx          # Login screen with hero-marina.png background
│   ├── board/
│   │   ├── layout.tsx        # Staff layout shell (top bar, dispatch paradigm)
│   │   └── page.tsx          # Placeholder: "Dispatch Board -- Phase 2"
│   ├── manager/
│   │   ├── layout.tsx        # Manager layout shell (top bar variant)
│   │   └── page.tsx          # Placeholder: "Analytics -- Phase 4"
│   └── guest/
│       ├── layout.tsx        # Guest layout shell (simple single-column)
│       └── page.tsx          # Placeholder: "Guest Portal -- Phase 3"
├── components/
│   ├── ui/                   # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── top-bar.tsx       # Navy top bar: logo + marina name + action area
│   │   └── user-menu.tsx     # User dropdown with logout
│   └── icons/                # SVG icon components or img wrappers
├── db/
│   ├── index.ts              # Drizzle + Neon connection
│   ├── schema.ts             # ALL tables (complete schema for all phases)
│   └── seed.ts               # Comprehensive seed script
├── lib/
│   ├── session.ts            # iron-session config and getSession helper
│   ├── auth.ts               # Login/logout server actions
│   └── utils.ts              # cn() helper (from shadcn)
├── middleware.ts              # Auth guard + role routing
└── styles/
    └── globals.css            # Tailwind @theme with design spec tokens
```

### Pattern 1: iron-session with Server Actions
**What:** Cookie-based auth using server actions for login/logout, iron-session for encrypted cookie management.
**When to use:** Every authenticated request.
**Example:**
```typescript
// src/lib/session.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: number;
  role: "staff" | "manager" | "guest";
  name: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "harborpass-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,  // "lax" not "strict" -- strict breaks redirect-after-login
    maxAge: 60 * 60 * 24 * 7, // 7 days -- ensures AUTH-02 (survives refresh)
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
```

```typescript
// src/lib/auth.ts
"use server";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  await session.save();

  // Role-based redirect (AUTH-04)
  const routes = { staff: "/board", manager: "/manager", guest: "/guest" };
  redirect(routes[user.role]);
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
```

### Pattern 2: Next.js Middleware for Auth Guard
**What:** Lightweight middleware that checks cookie existence and redirects unauthenticated users.
**When to use:** Every non-public route.
**Important:** Middleware runs on Edge -- cannot decrypt iron-session cookie here (no Node.js crypto). Only check cookie existence. Role validation happens in server components/actions.
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("harborpass-session");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Unauthenticated user trying to access protected page
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated user on login page -- redirect to home
  // (Role-based redirect handled in the root page.tsx or layout)
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|assets|favicon.ico).*)"],
};
```

### Pattern 3: Drizzle Schema with Enums and Relations
**What:** Complete schema defined upfront so seed data can populate all tables.
**When to use:** All database interactions.
**Key decisions:**
- Use `pgEnum` for slip_status and user_role
- Use `pgTable` with explicit column types
- Define relations for Drizzle's relational query API
- Include all tables needed for the full app, not just Phase 1

```typescript
// Key schema tables for Phase 1 seed data
export const userRoleEnum = pgEnum("user_role", ["staff", "manager", "guest"]);
export const slipStatusEnum = pgEnum("slip_status", ["available", "occupied", "departing_today", "maintenance"]);
export const slipSizeEnum = pgEnum("slip_size", ["small", "medium", "large"]);
export const stayStatusEnum = pgEnum("stay_status", ["reserved", "checked_in", "checked_out"]);
export const fuelTypeEnum = pgEnum("fuel_type", ["diesel", "gas"]);
export const amenityTypeEnum = pgEnum("amenity_type", ["shower", "fuel", "shore_power", "pump_out", "laundry"]);

// users: id, name, email, passwordHash, role, phone, createdAt
// slips: id, name (T-1..T-20), maxLoa, maxBeam, waterDepth, size, status, hasShorepower
// guests: id, name, email, phone, vesselName, vesselLoa, vesselBeam, vesselDraft, createdAt
// stays: id, guestId, slipId, checkIn, checkOut (nullable), expectedDeparture, status, gateCode, wifiPassword, showerTokens, showerTokensUsed, nightlyRate, createdAt
// amenity_usage: id, stayId, type, quantity, unitPrice, totalAmount, notes, createdAt
// charges: id, stayId, description, category, amount, createdAt
// pricing: id, category, name, rate, unit, createdAt, updatedAt
```

### Pattern 4: Tailwind v4 Theme with Design Spec Colors
**What:** CSS-based theme configuration (no tailwind.config.ts in v4).
**Example:**
```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-navy: #0F2B46;
  --color-ocean: #1B6FA8;
  --color-teal: #0D9488;
  --color-sand: #F5F0E8;
  --color-rope: #C4883A;
  --color-coral: #DC4A3F;
  --color-slate: #64748B;
  --color-fog: #E2E8F0;

  --font-heading: "DM Sans", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

Then use as: `bg-sand`, `text-navy`, `text-ocean`, `bg-teal`, `border-fog`, `font-heading`, `font-body`, `font-mono`.

### Pattern 5: Fonts via next/font/google
**What:** Self-hosted Google Fonts with zero layout shift.
```typescript
// src/app/layout.tsx
import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

// Apply to <body>: className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
```

### Anti-Patterns to Avoid
- **Sidebar navigation on staff view:** The dispatch board is full-width. No sidebar, ever.
- **Stat cards / KPI widgets:** Column header counts are sufficient. No big number cards.
- **Tab navigation:** Staff have one view (the board). Manager/guest are separate routes via role routing.
- **Dashboard chrome:** No breadcrumbs, no footer links, no "Getting Started" banners.
- **Partial schema:** Define ALL tables in Phase 1 even though most are used in later phases. The seed script needs them all.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie encryption | Custom JWT/cookie logic | iron-session | Handles encryption, signing, cookie options, session destroy |
| Password hashing | Custom hash function | bcryptjs | Salt generation, timing-attack-safe comparison built in |
| Component primitives | Custom button/card/input | shadcn/ui | Accessible, keyboard-navigable, ARIA-compliant out of the box |
| CSS theme tokens | Manual CSS variable management | Tailwind v4 @theme | Generates utilities automatically from declared tokens |
| Font loading | Manual @font-face declarations | next/font/google | Automatic self-hosting, preload, zero layout shift |
| Form validation | Manual if/else validation | Zod | Type-safe schemas, composable, reusable server + client |
| Date arithmetic | Manual Date math | date-fns | Handles timezone edge cases, immutable, tree-shakeable |

## Common Pitfalls

### Pitfall 1: SameSite=Strict Breaks Login Redirect
**What goes wrong:** User logs in, server action sets cookie and calls redirect(), but the browser does not send the cookie on the redirect because SameSite=strict blocks cookies on cross-origin navigations (and some browsers treat server-action redirects as cross-origin).
**Why it happens:** STACK.md example uses SameSite=strict. This is too restrictive for the login flow.
**How to avoid:** Use `sameSite: "lax"` in iron-session cookie options. Lax allows cookies on top-level navigations (which is what redirect does).
**Warning signs:** Login appears to succeed but user lands on login page again.

### Pitfall 2: Middleware Cannot Decrypt iron-session
**What goes wrong:** Developer tries to read session data (role, userId) in middleware.ts to do role-based routing. Fails because middleware runs on Edge Runtime which lacks Node.js crypto needed by iron-session.
**Why it happens:** iron-session uses Node.js `crypto` module for decryption. Edge Runtime does not have it.
**How to avoid:** Middleware only checks cookie existence (is the user logged in?). Role-based routing happens in server components or a shared layout that reads the session server-side.
**Warning signs:** Runtime error in middleware about crypto or unsupported APIs.

### Pitfall 3: Seed Script Date Anchoring
**What goes wrong:** Seed data uses hardcoded dates (e.g., "2026-03-28"). Demo breaks when run on a different date because "arriving today" and "departing today" no longer match.
**Why it happens:** Developer writes seed data with literal dates instead of relative dates.
**How to avoid:** Anchor all dates relative to `new Date()` at seed time. "Arriving today" = today's date. "Arrived 3 days ago" = `subDays(today, 3)`. Use date-fns for arithmetic.
**Warning signs:** Demo scenario does not show expected arrivals/departures after initial setup.

### Pitfall 4: Incomplete Schema Requires Migration Later
**What goes wrong:** Phase 1 only defines users, slips, and stays tables. Phase 2 needs amenity_usage and charges tables. Adding them requires a migration that may break seed data or require re-seeding.
**Why it happens:** YAGNI instinct -- "we will add tables when we need them."
**How to avoid:** Define the complete schema in Phase 1. The seed script needs all tables to create the realistic demo scenario (amenity usage history, charges, pricing config). Schema changes in later phases should be column additions, not new tables.
**Warning signs:** Seed script cannot populate required demo data because tables do not exist yet.

### Pitfall 5: create-next-app Version Mismatch
**What goes wrong:** Running `npx create-next-app@latest` installs Next.js 16.x instead of 15.x, which has latency regressions and may have breaking changes with iron-session or shadcn.
**Why it happens:** `@latest` resolves to the newest stable version, which is now 16.2.1.
**How to avoid:** Explicitly use `npx create-next-app@15` to get 15.5.14.
**Warning signs:** package.json shows next@16.x after scaffolding.

### Pitfall 6: Tailwind v4 @theme Syntax Errors
**What goes wrong:** Developer uses Tailwind v3 config syntax (tailwind.config.ts, theme.extend.colors) which does not work in v4.
**Why it happens:** Most documentation and tutorials still reference v3 patterns.
**How to avoid:** In Tailwind v4, all customization goes in CSS using `@theme { }` blocks inside globals.css. No tailwind.config.ts file. shadcn init with Tailwind v4 handles this correctly.
**Warning signs:** Custom colors like `bg-navy` do not generate utilities.

## Code Examples

### Seed Script Pattern (Relative Dates)
```typescript
// src/db/seed.ts
import { subDays, addDays } from "date-fns";

const today = new Date();
today.setHours(0, 0, 0, 0);

const slips = [
  { name: "T-1", maxLoa: 30, maxBeam: 10, waterDepth: 6, size: "small" },
  { name: "T-2", maxLoa: 30, maxBeam: 10, waterDepth: 6, size: "small" },
  // ... T-3 through T-8: mix of small/medium
  { name: "T-9", maxLoa: 40, maxBeam: 14, waterDepth: 8, size: "medium" },
  // ... T-10 through T-15: medium
  { name: "T-16", maxLoa: 55, maxBeam: 18, waterDepth: 10, size: "large" },
  // ... T-17 through T-20: large
];

// Example stay: arrived 3 days ago, departing tomorrow
const stay = {
  guestId: guestId,
  slipId: slipId,
  checkIn: subDays(today, 3),
  expectedDeparture: addDays(today, 1),
  status: "checked_in",
  gateCode: "483291",
  wifiPassword: "harbor-smith-4829",
  showerTokens: 3,
  showerTokensUsed: 1,
  nightlyRate: 75, // cents or dollars -- use integer cents to avoid float issues
};
```

### Login Page Layout
```typescript
// Conceptual structure for login page
// Full-bleed hero-marina.png as background (object-cover)
// Centered white card (max-w-md) with:
//   - logo.svg at top
//   - "Welcome to HarborPass" heading (font-heading, text-navy)
//   - Email input
//   - Password input
//   - "Sign In" button (bg-ocean, hover:bg-ocean/90)
//   - Demo credentials hint section below (text-slate, smaller text)
```

### Top Bar Component
```typescript
// Navy (#0F2B46) background, full-width, ~64px tall
// Left: logo.svg + "Sunset Harbor Marina" in white font-heading
// Right: Action area (search icon, "+ Check In" button in Phase 2, user menu)
// User menu: name display + logout button
// No sidebar trigger, no hamburger menu
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.ts | @theme in CSS (Tailwind v4) | Tailwind 4.0 (Jan 2025) | No config file needed; all tokens in CSS |
| NextAuth v4 | iron-session for simple auth | Next.js 15 (Oct 2024) | Simpler cookie auth without OAuth complexity |
| Prisma | Drizzle ORM | 2024 ecosystem shift | Lighter serverless footprint, better TS inference |
| next/font separate package | Built into Next.js | Next.js 13+ | No extra install needed |
| pg (node-postgres) | @neondatabase/serverless | Neon adoption 2023+ | HTTP mode eliminates connection pooling issues in serverless |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- Wave 0 setup needed |
| Config file | None -- see Wave 0 |
| Quick run command | `npm test` (after setup) |
| Full suite command | `npm test` (after setup) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with email/password | integration | Verify login server action returns session | Wave 0 |
| AUTH-02 | Session persists refresh | manual-only | Browser test -- cookie persists across navigations | Manual |
| AUTH-03 | Logout from any page | integration | Verify logout action destroys session | Wave 0 |
| AUTH-04 | Role-based routing | integration | Verify redirect paths per role | Wave 0 |
| SLIP-01 | 20 slips with dimensions | unit | Verify seed creates 20 slips with max_loa/max_beam/water_depth | Wave 0 |
| SLIP-02 | Slip status tracking | unit | Verify slip status enum values exist in schema | Wave 0 |
| SLIP-04 | One active stay per slip | unit | Verify constraint prevents double-booking | Wave 0 |
| DEMO-01 | Seed creates marina + 20 slips | smoke | Run seed script, count slips | Wave 0 |
| DEMO-02 | Seed creates stays (12+3+2) | smoke | Run seed script, count stays by status | Wave 0 |
| DEMO-03 | Seed creates 3 accounts | smoke | Run seed script, verify accounts exist | Wave 0 |
| DEMO-04 | Seed creates amenity usage + history | smoke | Run seed script, count amenity records | Wave 0 |
| DEMO-05 | Seed creates repeat visitor | smoke | Run seed script, verify guest with 2 stays | Wave 0 |
| DSGN-01 | Dispatch board layout | manual-only | Visual inspection -- no sidebar/tabs/stat cards | Manual |
| DSGN-02 | Color palette matches spec | manual-only | Visual inspection of rendered pages | Manual |
| DSGN-03 | Typography: DM Sans, Inter, JetBrains Mono | manual-only | Visual inspection of font rendering | Manual |
| DSGN-04 | SVG/PNG assets used | manual-only | Visual inspection -- assets render on pages | Manual |
| DSGN-05 | Login hero-marina.png background | manual-only | Visual inspection of login page | Manual |
| DSGN-07 | Responsive design | manual-only | Resize browser, check layout | Manual |

### Sampling Rate
- **Per task commit:** `npm run build` (build must pass)
- **Per wave merge:** `npm run build && npm test` (when tests exist)
- **Phase gate:** Build passes + manual visual inspection of login flow and placeholder pages

### Wave 0 Gaps
- [ ] Test framework selection and setup (recommend vitest for Next.js compatibility)
- [ ] `vitest.config.ts` -- configuration for testing server actions and DB queries
- [ ] Seed verification tests -- automated checks that seed script produces expected data counts
- [ ] Auth integration tests -- verify login/logout server actions work correctly

**Note:** Many Phase 1 requirements are design/visual (DSGN-*) and are best verified by manual inspection. The automated tests focus on auth logic and seed data correctness.

## Open Questions

1. **Monetary storage: integer cents vs decimal?**
   - What we know: Floating point causes rounding errors with money. Integer cents (7500 = $75.00) is standard practice.
   - Recommendation: Use integer cents for all monetary columns (nightlyRate, charges, pricing). Display with `(amount / 100).toFixed(2)`.

2. **Seed script execution: npm script vs drizzle-kit seed?**
   - What we know: drizzle-kit does not have a built-in seed command. Common pattern is a standalone `tsx src/db/seed.ts` script.
   - Recommendation: Add `"db:seed": "npx tsx src/db/seed.ts"` to package.json scripts. Run after `drizzle-kit push`.

3. **Schema push strategy: push vs migrate?**
   - What we know: `drizzle-kit push` applies schema directly (good for dev). `drizzle-kit generate` + `drizzle-kit migrate` creates versioned migration files (good for production).
   - Recommendation: Use `drizzle-kit push` for this demo project. Simpler, no migration files to manage. Add `"db:push": "npx drizzle-kit push"` script.

## Sources

### Primary (HIGH confidence)
- npm registry -- verified all package versions (2026-03-28)
- `.planning/research/STACK.md` -- technology decisions and rationale
- `.planning/research/PITFALLS.md` -- domain-specific pitfalls
- `DESIGN-SPEC.md` -- complete UI specification
- `BRIEF.md` -- domain context and demo data requirements
- `01-CONTEXT.md` -- locked implementation decisions

### Secondary (MEDIUM confidence)
- iron-session GitHub (v8 API patterns)
- Drizzle ORM docs (neon-http adapter setup)
- shadcn/ui docs (Tailwind v4 support)

### Tertiary (LOW confidence)
- None -- all critical findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, stack decisions locked in STACK.md
- Architecture: HIGH -- patterns derived from official docs and STACK.md integration notes
- Pitfalls: HIGH -- cross-referenced PITFALLS.md research with iron-session and Next.js specifics
- Seed data: HIGH -- requirements explicitly detailed in CONTEXT.md and BRIEF.md

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving dependencies)
