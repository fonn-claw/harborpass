# HarborPass — Marina Guest Check-In & Amenity Access

## The Problem
Transient boaters pull into a marina and it's chaos. There's no system — dock staff are on the radio, scribbling slip assignments on a whiteboard, handing out gate codes on scraps of paper, and hoping someone remembers to log the pump-out usage. Boaters wait at the fuel dock or wander the grounds looking for someone to help.

Meanwhile, amenity usage is completely untracked. Who used the shower block 6 times? Who's been running shore power for 3 days without paying? The revenue leakage from untracked transient amenities is significant — transient slips are 40% higher margin than long-term, but only if you capture all the charges.

From operator feedback: "Guest experience data is completely untracked — pump-out usage, shower abuse, Wi-Fi overages." And from a B&B operator with the same dynamic: "Guest requests... it's a juggling act without a system."

## The Domain
Marina guest services — specifically the transient boater experience. A transient boater is someone staying 1-14 nights (not a seasonal slip holder). They may have booked ahead or just showed up.

A typical arrival:
1. Boater radios or walks up to the dock office
2. Staff finds an available slip that fits their vessel (length, beam, draft)
3. Staff assigns the slip, takes payment or a card on file
4. Boater gets: slip number, gate code, Wi-Fi password, shower code, pump-out location, marina rules
5. During stay: boater uses fuel, showers, laundry, pump-out, shore power
6. On departure: staff tallies usage, charges the card, clears the slip

Marina terminology: slip (the parking spot), transient (short-term guest), shore power (electrical hookup), pump-out (sewage disposal), draft (how deep the boat sits in water), LOA (length overall), beam (width).

## Users & What They Need

### Dock Staff
- Process arrivals quickly — a boater shouldn't wait more than 5 minutes
- See at a glance which slips are available RIGHT NOW and which fit the arriving vessel
- Assign a slip and generate all access credentials (gate, Wi-Fi, shower) in one action
- Log amenity usage as it happens (fuel dispensed, shower access, pump-out)
- Process departures — see all charges, settle the account, release the slip
- Know who's currently in the marina and when they're expected to leave

### Marina Manager
- See occupancy and turnover for transient slips
- Review revenue from transient guests and amenities
- Set pricing: per-night slip rates by size, amenity fees, fuel markup
- View guest history — repeat visitors, problem guests, VIPs

### Transient Boater (Guest)
- Know where to go when they arrive (slip assignment, directions)
- Have all their access info in one place (gate code, Wi-Fi, shower code)
- See what they've been charged and what they owe before departure
- Rate their stay or report an issue

## Demo Data
Sunset Harbor Marina (same universe as SlipSync, DockWatch, BillingHub).
It's a busy Friday in summer. The marina has 20 transient slips (out of 60 total).

Current state:
- 12 slips occupied by transient guests (various arrival dates, some leaving tomorrow)
- 3 guests arriving today (1 pre-booked, 2 walk-ups)
- 5 slips available
- A mix of amenity usage: some guests have used showers, fuel, pump-out
- 2 guests departing today with outstanding charges to settle
- 1 repeat visitor (came last month too)
- Guest history going back 2 months

### Demo Accounts
- staff@harborpass.app / demo1234 — Dock staff (check-in, check-out, amenity logging)
- manager@harborpass.app / demo1234 — Manager (reporting, pricing, guest history)
- guest@harborpass.app / demo1234 — A current transient boater (sees their stay info)

## Tech Stack
- Next.js with App Router
- Neon Postgres (NOT SQLite)
- Drizzle ORM
- Deploy to Vercel

## Notes
- Gate codes should look realistic (6-digit numeric)
- Wi-Fi passwords should be generated per-guest (simple, like "harbor-smith-4829")
- Shower/laundry access could be token-based (guest gets X tokens included, buys more)
- Shore power metering: log kWh usage per slip per day
- Fuel: log gallons and fuel type (diesel/gas) with price per gallon
- The check-in flow is the core experience — it should feel fast and purposeful, not like filling out a long form
