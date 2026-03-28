# Technology Stack

**Project:** HarborPass -- Marina Guest Check-In & Amenity Access
**Researched:** 2026-03-28

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (latest 15.5+) | Full-stack React framework | Specified by brief. Use 15.x rather than 16.x -- Next.js 16 is available but introduced latency regressions reported by users (GitHub issue #85470). 15.x is battle-tested on Vercel, has stable Turbopack dev, and all ecosystem libraries (Auth.js, shadcn, etc.) have full compatibility. For a single-session build, stability matters more than bleeding-edge speed. **Confidence: HIGH** |
| React | 19.x | UI library | Ships with Next.js 15. React 19 provides useActionState, useOptimistic, and Server Actions -- all useful for the check-in wizard flow. **Confidence: HIGH** |
| TypeScript | 5.x | Type safety | Non-negotiable for any production Next.js app. Drizzle ORM's type inference requires it. **Confidence: HIGH** |

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon Postgres | -- | Serverless PostgreSQL | Specified by brief. Serverless cold-start is fine for this use case (dock staff sessions are long-lived, not cold-start sensitive). Free tier supports demo needs. **Confidence: HIGH** |
| Drizzle ORM | 0.44+ | Type-safe SQL query builder | Specified by brief. Lightweight, excellent TypeScript inference, built-in Neon adapter via `drizzle-orm/neon-http`. Schema-as-code with `drizzle-kit` for migrations. **Confidence: HIGH** |
| drizzle-kit | 0.31+ | Schema migrations | Companion to drizzle-orm. Handles `push` for dev and `migrate` for production. **Confidence: HIGH** |
| @neondatabase/serverless | 0.10+ | Neon HTTP driver | Required for Drizzle's neon-http adapter. Uses HTTP for serverless-friendly connections (no persistent TCP). Compatible with Vercel Edge and serverless functions. **Confidence: HIGH** |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| iron-session | 8.x | Encrypted cookie sessions | This is a demo app with credential-only auth (no OAuth, no social login). Auth.js/NextAuth v5 is overkill -- it's still in beta for Next.js 15, has Edge runtime complications with database sessions, and adds complexity for zero benefit when you only have email/password. iron-session encrypts session data directly into a cookie -- no session table, no token rotation, no adapter config. Next.js official docs recommend it for this exact use case. **Confidence: HIGH** |
| bcryptjs | 2.4+ | Password hashing | Pure JS implementation, zero native dependencies, works in all Next.js runtimes including Edge. bcrypt (native) fails in Edge middleware and requires node-gyp. For a demo app, bcryptjs performance difference is irrelevant. **Confidence: HIGH** |

### UI & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | Industry standard for Next.js. v4 uses `@theme` directive in CSS (no tailwind.config.ts needed), generates utilities from CSS variables. Pairs with shadcn/ui. The design spec's color system maps cleanly to Tailwind custom theme variables. **Confidence: HIGH** |
| shadcn/ui | latest (not versioned -- copy-paste) | Component primitives | Not a package dependency -- components are copied into the project. Provides Dialog (check-in wizard), Sheet (settlement panel), Card (guest cards), Button, Input, Select, Badge, Tooltip, and Sonner integration. Built on Radix UI primitives. Updated for Tailwind v4 with `data-slot` attributes. **Confidence: HIGH** |
| Radix UI | (via shadcn) | Accessible primitives | Underlies shadcn components. Handles focus management, keyboard navigation, ARIA attributes for the wizard modal, slide-over panel, dropdowns. **Confidence: HIGH** |
| class-variance-authority | 0.7+ | Component variant API | Used by shadcn for component variants (button sizes, card status colors). Already included when you init shadcn. **Confidence: HIGH** |
| clsx + tailwind-merge | latest | Conditional class merging | Standard Tailwind pattern. `cn()` utility combines them. Included in shadcn setup. **Confidence: HIGH** |

### Form Handling & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 3.x | Schema validation | Use Zod 3.x (stable, 3.24+), not Zod 4.x. While Zod 4 is available with performance gains, the ecosystem (react-hook-form resolvers, shadcn form component) is still catching up. Zod 3 is proven and fully compatible. Used for both server-side validation in Server Actions and client-side form validation. **Confidence: MEDIUM -- Zod 4 may be fully compatible by now, but 3.x is the safe choice** |
| react-hook-form | 7.x | Client-side form state | Needed for the check-in wizard's multi-step form with client-side validation, field-level errors, and step transitions. Server Actions alone cannot provide the real-time validation UX the wizard needs (e.g., "LOA must be a number" as you type). Combined with Zod via `@hookform/resolvers`. **Confidence: HIGH** |
| @hookform/resolvers | 3.x | Zod-to-RHF bridge | Connects Zod schemas to react-hook-form validation. Standard pattern. **Confidence: HIGH** |

### Charts & Analytics (Manager View)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Recharts | 2.x | Occupancy and revenue charts | The manager view needs basic bar/line charts for occupancy trends and revenue breakdown. Recharts is the standard React charting library, used under the hood by shadcn's chart components. Tremor is an alternative but adds unnecessary abstraction for 2-3 simple charts. **Confidence: HIGH** |

### Utilities

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| date-fns | 3.x | Date formatting and math | Stay duration calculations, "arrives today" logic, departure date formatting. Lightweight, tree-shakeable, no mutable Date objects. Preferred over dayjs for TypeScript-first projects. **Confidence: HIGH** |
| sonner | 2.x | Toast notifications | "Amenity logged" confirmations, check-in success, error toasts. ~3KB, zero-config, works with Server Actions via client-side handlers. shadcn includes a Sonner wrapper component. **Confidence: HIGH** |
| next-themes | 0.4+ | Theme provider | Only needed if dark mode is desired. The design spec uses a warm sand palette -- dark mode is likely out of scope. Include only if explicitly needed. **Confidence: MEDIUM** |

### Fonts

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next/font | (built-in) | Font loading | Use `next/font/google` for DM Sans (headings), Inter (body), JetBrains Mono (credentials). Automatic font optimization, no layout shift, self-hosted from Vercel CDN. **Confidence: HIGH** |

### Development

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Turbopack | (built into Next.js 15) | Dev server bundler | `next dev --turbo` for fast HMR. Stable in Next.js 15. **Confidence: HIGH** |
| drizzle-kit | 0.31+ | DB migrations CLI | `npx drizzle-kit push` for dev, `npx drizzle-kit migrate` for production schema changes. **Confidence: HIGH** |
| dotenv | (built into Next.js) | Environment variables | `.env.local` for DATABASE_URL and SESSION_SECRET. Next.js loads this natively. **Confidence: HIGH** |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth | iron-session | Auth.js (NextAuth v5) | Still in beta, Edge runtime issues with DB sessions, massive overkill for credential-only demo auth with 3 hardcoded accounts |
| Auth | iron-session | Clerk/WorkOS | External SaaS dependency for a demo app. Adds complexity, cost, and vendor lock-in for zero benefit |
| ORM | Drizzle | Prisma | Specified by brief. Also: Prisma is heavier, slower cold starts on serverless, and Drizzle's SQL-like API is more transparent |
| Styling | Tailwind + shadcn | Material UI / Chakra | Too opinionated for the custom dispatch board design. shadcn gives primitives you own and style freely |
| Charts | Recharts | Tremor | Tremor is built on Recharts anyway. Extra abstraction for 2-3 charts is not worth it |
| Forms | react-hook-form | Formik | RHF is lighter, faster, better TypeScript support, and the shadcn Form component is built for it |
| Validation | Zod 3.x | Zod 4.x | Zod 4 has better perf but ecosystem compatibility (RHF resolvers, shadcn) may lag. Safe choice is 3.x |
| Dates | date-fns | dayjs | date-fns is more TypeScript-native, tree-shakeable, immutable. dayjs works but has weaker TS types |
| State mgmt | React state + Server Components | Zustand | Overkill. The dispatch board data comes from server (DB queries in RSC). Client state is limited to wizard form steps and UI toggles -- React useState handles this. No global client store needed |
| Toast | Sonner | react-hot-toast | Sonner is smaller, better defaults, shadcn integration out of the box |
| Next.js version | 15.x | 16.x | 16 has reported latency regressions. 15.x is proven on Vercel. Upgrade later if needed |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Redux / Zustand / Jotai | No global client state needed. Server Components fetch data; wizard state is local |
| Prisma | Brief specifies Drizzle. Also heavier serverless overhead |
| NextAuth v5 / Auth.js | Beta, Edge complications, overkill for credential-only demo |
| tRPC | Overkill. Server Actions + Drizzle queries in RSC handle all data needs |
| React Query / SWR | Not needed. Server Components fetch data on render. The dispatch board is not a polling/real-time app (staff refresh or navigate to see updates) |
| Framer Motion | The design spec calls for subtle CSS transitions (300ms ease-out card slides, opacity pulses). CSS animations handle this -- no need for a 30KB animation library |
| SQLite / better-sqlite3 | Brief explicitly says Neon Postgres. Do NOT substitute |

## Installation

```bash
# Create Next.js app
npx create-next-app@latest harborpass --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install iron-session bcryptjs
npm install -D @types/bcryptjs

# Form handling & validation
npm install react-hook-form @hookform/resolvers zod

# UI (shadcn adds its own dependencies)
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet input select badge tooltip sonner

# Charts
npm install recharts

# Utilities
npm install date-fns
```

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/harborpass?sslmode=require"
SESSION_SECRET="random-32-char-string-for-iron-session-encryption"
```

## Key Integration Notes

### Drizzle + Neon Setup
```typescript
// src/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### iron-session Pattern
```typescript
// src/lib/session.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: number;
  role: "staff" | "manager" | "guest";
  name: string;
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: "harborpass-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  });
}
```

### Auth Middleware Pattern
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Check for session cookie existence (not decryption -- that happens in pages)
  const session = request.cookies.get("harborpass-session");
  if (!session && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|login|public|assets).*)"],
};
```

## Sources

- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15) -- HIGH confidence
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- HIGH confidence
- [Next.js 16 Latency Regression](https://github.com/vercel/next.js/issues/85470) -- HIGH confidence
- [Drizzle ORM + Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon) -- HIGH confidence
- [Drizzle Neon Connection Docs](https://orm.drizzle.team/docs/connect-neon) -- HIGH confidence
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) -- HIGH confidence
- [iron-session GitHub](https://github.com/vvo/iron-session) -- HIGH confidence
- [shadcn/ui Tailwind v4 Support](https://ui.shadcn.com/docs/tailwind-v4) -- HIGH confidence
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) -- HIGH confidence
- [Zod v4 Release Notes](https://zod.dev/v4) -- HIGH confidence
- [Sonner GitHub](https://github.com/emilkowalski/sonner) -- HIGH confidence
- [Recharts](https://recharts.org/) -- HIGH confidence
