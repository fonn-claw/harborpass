import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local for standalone script execution
const envPath = resolve(process.cwd(), ".env.local");
if (!process.env.DATABASE_URL && existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

import { db } from "./index";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import { subDays, addDays, startOfDay } from "date-fns";
import { sql } from "drizzle-orm";

const today = startOfDay(new Date());

function gateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function wifiPass(lastName: string): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `harbor-${lastName.toLowerCase()}-${digits}`;
}

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data (reverse dependency order)
  await db.delete(schema.charges);
  await db.delete(schema.amenityUsage);
  await db.delete(schema.stays);
  await db.delete(schema.guests);
  await db.delete(schema.slips);
  await db.delete(schema.users);
  await db.delete(schema.pricing);

  // 2. Create demo users
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const insertedUsers = await db
    .insert(schema.users)
    .values([
      { name: "Alex Rivera", email: "staff@harborpass.app", passwordHash, role: "staff", phone: "555-0101" },
      { name: "Jordan Chen", email: "manager@harborpass.app", passwordHash, role: "manager", phone: "555-0102" },
      { name: "Sam Mitchell", email: "guest@harborpass.app", passwordHash, role: "guest", phone: "555-0201" },
    ])
    .returning();

  console.log(`  Users: ${insertedUsers.length}`);

  // 3. Create 20 transient slips
  const slipDefs: { name: string; size: "small" | "medium" | "large"; maxLoa: number; maxBeam: number; waterDepth: number; status: "available" | "occupied" | "departing_today" | "maintenance" }[] = [];

  for (let i = 1; i <= 20; i++) {
    let size: "small" | "medium" | "large";
    let maxLoa: number, maxBeam: number, waterDepth: number;

    if (i <= 8) {
      size = "small";
      maxLoa = 30; maxBeam = 10; waterDepth = 6;
    } else if (i <= 15) {
      size = "medium";
      maxLoa = 40; maxBeam = 14; waterDepth = 8;
    } else {
      size = "large";
      maxLoa = 55; maxBeam = 18; waterDepth = 10;
    }

    slipDefs.push({
      name: `T-${i}`,
      size,
      maxLoa,
      maxBeam,
      waterDepth,
      status: i === 4 ? "maintenance" : "available",
      // hasShorepower defaults to true
    });
  }

  const insertedSlips = await db.insert(schema.slips).values(slipDefs).returning();
  const slipMap = new Map(insertedSlips.map((s) => [s.name, s]));

  console.log(`  Slips: ${insertedSlips.length}`);

  // 4. Create pricing config
  await db.insert(schema.pricing).values([
    // Slip rates by size
    { category: "slip", name: "Small Nightly", rate: 5500, unit: "night" },
    { category: "slip", name: "Medium Nightly", rate: 8500, unit: "night" },
    { category: "slip", name: "Large Nightly", rate: 12500, unit: "night" },
    // Amenity fees
    { category: "amenity", name: "Shower Token", rate: 300, unit: "use" },
    { category: "amenity", name: "Laundry Token", rate: 500, unit: "use" },
    { category: "amenity", name: "Pump-out", rate: 1500, unit: "service" },
    { category: "amenity", name: "Shore Power", rate: 1200, unit: "day" },
    // Fuel
    { category: "fuel", name: "Diesel", rate: 549, unit: "gallon" },
    { category: "fuel", name: "Gas", rate: 429, unit: "gallon" },
  ]);

  // 5. Create current guests (12 occupied stays)
  interface CurrentGuest {
    name: string;
    vessel: string;
    loa: number;
    beam: number;
    draft: number;
    slip: string;
    arrivedDaysAgo: number;
    departsInDays: number; // 0 = today, negative would be past
    rate: number;
    phone: string;
    email?: string;
    showerTokensUsed: number;
    isDepartingToday: boolean;
  }

  const currentGuests: CurrentGuest[] = [
    // Catalina 36
    { name: "Robert Thompson", vessel: "Wind Dancer", loa: 36, beam: 12, draft: 5, slip: "T-9", arrivedDaysAgo: 5, departsInDays: 1, rate: 8500, phone: "555-1001", showerTokensUsed: 2, isDepartingToday: false },
    // Beneteau 40
    { name: "Maria Santos", vessel: "Seas the Day", loa: 40, beam: 13, draft: 6, slip: "T-10", arrivedDaysAgo: 3, departsInDays: 2, rate: 8500, phone: "555-1002", showerTokensUsed: 1, isDepartingToday: false },
    // Boston Whaler 27
    { name: "James Wilson", vessel: "Liberty", loa: 27, beam: 9, draft: 3, slip: "T-1", arrivedDaysAgo: 2, departsInDays: 1, rate: 5500, phone: "555-1003", showerTokensUsed: 0, isDepartingToday: false },
    // Jeanneau 45
    { name: "Catherine Park", vessel: "Blue Horizon", loa: 45, beam: 14, draft: 7, slip: "T-16", arrivedDaysAgo: 4, departsInDays: 3, rate: 12500, phone: "555-1004", showerTokensUsed: 2, isDepartingToday: false },
    // Hunter 33
    { name: "David Murphy", vessel: "Salty Dog", loa: 33, beam: 11, draft: 5, slip: "T-5", arrivedDaysAgo: 1, departsInDays: 2, rate: 5500, phone: "555-1005", showerTokensUsed: 0, isDepartingToday: false },
    // Catalina 42
    { name: "Sarah Nguyen", vessel: "Southern Cross", loa: 38, beam: 13, draft: 6, slip: "T-11", arrivedDaysAgo: 6, departsInDays: 0, rate: 8500, phone: "555-1006", showerTokensUsed: 3, isDepartingToday: true },
    // Island Packet 37
    { name: "Michael Brown", vessel: "Second Wind", loa: 37, beam: 12, draft: 5, slip: "T-12", arrivedDaysAgo: 3, departsInDays: 1, rate: 8500, phone: "555-1007", showerTokensUsed: 0, isDepartingToday: false },
    // Pearson 30
    { name: "Lisa Anderson", vessel: "Moonrise", loa: 30, beam: 10, draft: 5, slip: "T-2", arrivedDaysAgo: 7, departsInDays: 0, rate: 5500, phone: "555-1008", showerTokensUsed: 2, isDepartingToday: true },
    // Hatteras 52
    { name: "Tom Henderson", vessel: "Fair Winds", loa: 52, beam: 17, draft: 8, slip: "T-17", arrivedDaysAgo: 2, departsInDays: 4, rate: 12500, phone: "555-1009", showerTokensUsed: 1, isDepartingToday: false },
    // Catalina 28
    { name: "Jennifer Clark", vessel: "Compass Rose", loa: 28, beam: 10, draft: 4, slip: "T-3", arrivedDaysAgo: 4, departsInDays: 1, rate: 5500, phone: "555-1010", showerTokensUsed: 0, isDepartingToday: false },
    // Grady-White 28
    { name: "Steve Garcia", vessel: "Reel Deal", loa: 28, beam: 9, draft: 3, slip: "T-6", arrivedDaysAgo: 1, departsInDays: 3, rate: 5500, phone: "555-1011", showerTokensUsed: 0, isDepartingToday: false },
    // Beneteau 50
    { name: "Karen Williams", vessel: "Starlight", loa: 50, beam: 16, draft: 7, slip: "T-18", arrivedDaysAgo: 3, departsInDays: 2, rate: 12500, phone: "555-1012", showerTokensUsed: 1, isDepartingToday: false },
  ];

  // Sam Mitchell (guest demo account) - Catalina 42 - occupies T-13
  const samMitchellGuest: CurrentGuest = {
    name: "Sam Mitchell",
    vessel: "Pacific Dream",
    loa: 42,
    beam: 14,
    draft: 6,
    slip: "T-13",
    arrivedDaysAgo: 2,
    departsInDays: 3,
    rate: 8500,
    phone: "555-0201",
    email: "guest@harborpass.app",
    showerTokensUsed: 1,
    isDepartingToday: false,
  };

  const allCurrentGuests = [...currentGuests, samMitchellGuest];

  // Insert guest records and stays for current guests
  const guestStayMap: { guestId: number; stayId: number; guest: CurrentGuest }[] = [];

  for (const g of allCurrentGuests) {
    const slip = slipMap.get(g.slip)!;
    const checkInDate = subDays(today, g.arrivedDaysAgo);
    const expectedDep = g.departsInDays === 0 ? today : addDays(today, g.departsInDays);

    const [insertedGuest] = await db
      .insert(schema.guests)
      .values({
        name: g.name,
        email: g.email || `${g.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: g.phone,
        vesselName: g.vessel,
        vesselLoa: g.loa,
        vesselBeam: g.beam,
        vesselDraft: g.draft,
        createdAt: checkInDate,
      })
      .returning();

    const [insertedStay] = await db
      .insert(schema.stays)
      .values({
        guestId: insertedGuest.id,
        slipId: slip.id,
        checkIn: checkInDate,
        expectedDeparture: expectedDep,
        status: "checked_in",
        gateCode: gateCode(),
        wifiPassword: wifiPass(g.name.split(" ").pop()!),
        showerTokens: 3,
        showerTokensUsed: g.showerTokensUsed,
        nightlyRate: g.rate,
        isPreBooked: false,
        createdAt: checkInDate,
      })
      .returning();

    guestStayMap.push({ guestId: insertedGuest.id, stayId: insertedStay.id, guest: g });

    // Update slip status
    const slipStatus = g.isDepartingToday ? "departing_today" : "occupied";
    await db.update(schema.slips).set({ status: slipStatus }).where(sql`id = ${slip.id}`);
  }

  console.log(`  Current guests: ${allCurrentGuests.length} (checked-in)`);

  // 6. Create 3 arriving-today guests
  // Pre-booked: Daniel Foster - Sabre 38
  const [danielGuest] = await db
    .insert(schema.guests)
    .values({
      name: "Daniel Foster",
      email: "daniel.foster@example.com",
      phone: "555-2001",
      vesselName: "Northern Star",
      vesselLoa: 38,
      vesselBeam: 13,
      vesselDraft: 5,
      createdAt: subDays(today, 3), // booked 3 days ago
    })
    .returning();

  await db.insert(schema.stays).values({
    guestId: danielGuest.id,
    slipId: null,
    checkIn: today,
    expectedDeparture: addDays(today, 3),
    status: "reserved",
    gateCode: null,
    wifiPassword: null,
    showerTokens: 0,
    showerTokensUsed: 0,
    nightlyRate: 8500,
    isPreBooked: true,
    createdAt: subDays(today, 3),
  });

  // Walk-ups: Rachel Kim (Sea Ray 26) and Mark Johnson (Wellcraft 32)
  const [rachelGuest] = await db
    .insert(schema.guests)
    .values({
      name: "Rachel Kim",
      email: "rachel.kim@example.com",
      phone: "555-2002",
      vesselName: "Day Tripper",
      vesselLoa: 26,
      vesselBeam: 9,
      vesselDraft: 3,
      createdAt: today,
    })
    .returning();

  await db.insert(schema.stays).values({
    guestId: rachelGuest.id,
    slipId: null,
    checkIn: today,
    expectedDeparture: addDays(today, 2),
    status: "reserved",
    gateCode: null,
    wifiPassword: null,
    showerTokens: 0,
    showerTokensUsed: 0,
    nightlyRate: 5500,
    isPreBooked: false,
    createdAt: today,
  });

  const [markGuest] = await db
    .insert(schema.guests)
    .values({
      name: "Mark Johnson",
      email: "mark.johnson@example.com",
      phone: "555-2003",
      vesselName: "Easy Rider",
      vesselLoa: 32,
      vesselBeam: 11,
      vesselDraft: 4,
      createdAt: today,
    })
    .returning();

  await db.insert(schema.stays).values({
    guestId: markGuest.id,
    slipId: null,
    checkIn: today,
    expectedDeparture: addDays(today, 3),
    status: "reserved",
    gateCode: null,
    wifiPassword: null,
    showerTokens: 0,
    showerTokensUsed: 0,
    nightlyRate: 5500,
    isPreBooked: false,
    createdAt: today,
  });

  console.log(`  Arriving today: 3 (1 pre-booked, 2 walk-ups)`);

  // 7. Create amenity usage for current stays
  let amenityCount = 0;

  // Helper: add amenity and charge
  async function addAmenity(
    stayId: number,
    type: "shower" | "fuel" | "shore_power" | "pump_out" | "laundry",
    quantity: number,
    unitPrice: number,
    totalAmount: number,
    description: string,
    category: string,
    fuelType?: "diesel" | "gas",
    daysAgo?: number,
  ) {
    const createdAt = daysAgo !== undefined ? subDays(today, daysAgo) : subDays(today, 1);
    await db.insert(schema.amenityUsage).values({
      stayId,
      type,
      quantity: String(quantity),
      unitPrice,
      totalAmount,
      fuelType: fuelType || null,
      createdAt,
    });
    await db.insert(schema.charges).values({
      stayId,
      description,
      category,
      amount: totalAmount,
      createdAt,
    });
    amenityCount++;
  }

  // Helper: find stay by guest name
  function findStay(name: string) {
    const entry = guestStayMap.find((e) => e.guest.name === name);
    if (!entry) throw new Error(`Guest not found: ${name}`);
    return entry;
  }

  // Robert Thompson: 2 showers, 15 gal diesel
  const robert = findStay("Robert Thompson");
  await addAmenity(robert.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 3);
  await addAmenity(robert.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 1);
  await addAmenity(robert.stayId, "fuel", 15, 549, 8235, "Diesel fuel (15 gal)", "fuel", "diesel", 2);

  // Maria Santos: 1 shower, shore power 3 days
  const maria = findStay("Maria Santos");
  await addAmenity(maria.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 2);
  await addAmenity(maria.stayId, "shore_power", 3, 1200, 3600, "Shore power (3 days)", "amenity", undefined, 1);

  // James Wilson: pump-out
  const james = findStay("James Wilson");
  await addAmenity(james.stayId, "pump_out", 1, 1500, 1500, "Pump-out service", "amenity", undefined, 1);

  // Catherine Park: 2 showers, 1 laundry, shore power 4 days, 25 gal diesel
  const catherine = findStay("Catherine Park");
  await addAmenity(catherine.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 3);
  await addAmenity(catherine.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 1);
  await addAmenity(catherine.stayId, "laundry", 1, 500, 500, "Laundry token", "amenity", undefined, 2);
  await addAmenity(catherine.stayId, "shore_power", 4, 1200, 4800, "Shore power (4 days)", "amenity", undefined, 1);
  await addAmenity(catherine.stayId, "fuel", 25, 549, 13725, "Diesel fuel (25 gal)", "fuel", "diesel", 2);

  // Sarah Nguyen (departing today): 3 showers, 2 laundry, pump-out, shore power 6 days
  const sarah = findStay("Sarah Nguyen");
  await addAmenity(sarah.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 5);
  await addAmenity(sarah.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 3);
  await addAmenity(sarah.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 1);
  await addAmenity(sarah.stayId, "laundry", 1, 500, 500, "Laundry token", "amenity", undefined, 4);
  await addAmenity(sarah.stayId, "laundry", 1, 500, 500, "Laundry token", "amenity", undefined, 2);
  await addAmenity(sarah.stayId, "pump_out", 1, 1500, 1500, "Pump-out service", "amenity", undefined, 3);
  await addAmenity(sarah.stayId, "shore_power", 6, 1200, 7200, "Shore power (6 days)", "amenity", undefined, 1);

  // Lisa Anderson (departing today): 2 showers, pump-out, 10 gal gas
  const lisa = findStay("Lisa Anderson");
  await addAmenity(lisa.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 5);
  await addAmenity(lisa.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 2);
  await addAmenity(lisa.stayId, "pump_out", 1, 1500, 1500, "Pump-out service", "amenity", undefined, 3);
  await addAmenity(lisa.stayId, "fuel", 10, 429, 4290, "Gas fuel (10 gal)", "fuel", "gas", 4);

  // Tom Henderson: 1 shower, 30 gal diesel, shore power 2 days
  const tom = findStay("Tom Henderson");
  await addAmenity(tom.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 1);
  await addAmenity(tom.stayId, "fuel", 30, 549, 16470, "Diesel fuel (30 gal)", "fuel", "diesel", 1);
  await addAmenity(tom.stayId, "shore_power", 2, 1200, 2400, "Shore power (2 days)", "amenity", undefined, 1);

  // Karen Williams: 1 shower, 1 laundry
  const karen = findStay("Karen Williams");
  await addAmenity(karen.stayId, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 2);
  await addAmenity(karen.stayId, "laundry", 1, 500, 500, "Laundry token", "amenity", undefined, 1);

  // Create nightly charges for all current stays
  for (const entry of guestStayMap) {
    const { stayId, guest } = entry;
    const nights = guest.arrivedDaysAgo;
    for (let n = 0; n < nights; n++) {
      await db.insert(schema.charges).values({
        stayId,
        description: `Nightly slip rate`,
        category: "slip",
        amount: guest.rate,
        createdAt: subDays(today, nights - n),
      });
    }
  }

  console.log(`  Amenity records: ${amenityCount}`);

  // 8. Repeat visitor: Robert Thompson's previous stay (~4 weeks ago)
  const [robertPrevStay] = await db
    .insert(schema.stays)
    .values({
      guestId: robert.guestId,
      slipId: slipMap.get("T-10")!.id,
      checkIn: subDays(today, 32),
      checkOut: subDays(today, 28),
      expectedDeparture: subDays(today, 28),
      status: "checked_out",
      gateCode: gateCode(),
      wifiPassword: wifiPass("thompson"),
      showerTokens: 3,
      showerTokensUsed: 2,
      nightlyRate: 8500,
      isPreBooked: false,
      createdAt: subDays(today, 32),
    })
    .returning();

  // Previous stay amenities
  await addAmenity(robertPrevStay.id, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 31);
  await addAmenity(robertPrevStay.id, "shower", 1, 300, 300, "Shower token", "amenity", undefined, 29);
  await addAmenity(robertPrevStay.id, "pump_out", 1, 1500, 1500, "Pump-out service", "amenity", undefined, 30);

  // Previous stay nightly charges (4 nights)
  for (let n = 0; n < 4; n++) {
    await db.insert(schema.charges).values({
      stayId: robertPrevStay.id,
      description: "Nightly slip rate",
      category: "slip",
      amount: 8500,
      createdAt: subDays(today, 32 - n),
    });
  }

  // 9. Guest history: 15 past completed stays
  interface PastGuest {
    name: string;
    vessel: string;
    loa: number;
    beam: number;
    draft: number;
    slip: string;
    arrivedWeeksAgo: number;
    nights: number;
    rate: number;
    amenities: { type: "shower" | "fuel" | "shore_power" | "pump_out" | "laundry"; qty: number; unitPrice: number; total: number; desc: string; cat: string; fuelType?: "diesel" | "gas" }[];
  }

  const pastGuests: PastGuest[] = [
    /* Sea Ray 24 */    { name: "Alice Cooper", vessel: "Day Dream", loa: 24, beam: 8, draft: 3, slip: "T-7", arrivedWeeksAgo: 8, nights: 2, rate: 5500, amenities: [] },
    /* Catalina 30 */   { name: "Brian Lee", vessel: "Wanderlust", loa: 30, beam: 10, draft: 5, slip: "T-3", arrivedWeeksAgo: 7, nights: 3, rate: 5500, amenities: [{ type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }] },
    /* Island Packet 40 */ { name: "Carol Martinez", vessel: "Serenity", loa: 40, beam: 14, draft: 6, slip: "T-14", arrivedWeeksAgo: 6, nights: 5, rate: 8500, amenities: [{ type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }, { type: "shore_power", qty: 5, unitPrice: 1200, total: 6000, desc: "Shore power (5 days)", cat: "amenity" }] },
    /* Boston Whaler 25 */ { name: "Dennis Wright", vessel: "Wave Runner", loa: 25, beam: 9, draft: 3, slip: "T-1", arrivedWeeksAgo: 6, nights: 1, rate: 5500, amenities: [] },
    /* Beneteau 45 */   { name: "Elena Volkov", vessel: "Aurora", loa: 45, beam: 15, draft: 7, slip: "T-16", arrivedWeeksAgo: 5, nights: 4, rate: 12500, amenities: [{ type: "fuel", qty: 20, unitPrice: 549, total: 10980, desc: "Diesel fuel (20 gal)", cat: "fuel", fuelType: "diesel" }, { type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }] },
    /* Hunter 36 */     { name: "Frank Osborne", vessel: "Pegasus", loa: 36, beam: 12, draft: 5, slip: "T-9", arrivedWeeksAgo: 5, nights: 3, rate: 8500, amenities: [{ type: "pump_out", qty: 1, unitPrice: 1500, total: 1500, desc: "Pump-out service", cat: "amenity" }] },
    /* Catalina 34 */   { name: "Grace Taylor", vessel: "Sunset Chaser", loa: 34, beam: 11, draft: 5, slip: "T-5", arrivedWeeksAgo: 4, nights: 2, rate: 5500, amenities: [{ type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }] },
    /* Pearson 28 */    { name: "Henry Adams", vessel: "Old Faithful", loa: 28, beam: 10, draft: 4, slip: "T-2", arrivedWeeksAgo: 4, nights: 4, rate: 5500, amenities: [{ type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }, { type: "laundry", qty: 1, unitPrice: 500, total: 500, desc: "Laundry token", cat: "amenity" }] },
    /* Jeanneau 38 */   { name: "Irene Patel", vessel: "Trade Wind", loa: 38, beam: 13, draft: 5, slip: "T-11", arrivedWeeksAgo: 3, nights: 3, rate: 8500, amenities: [{ type: "shore_power", qty: 3, unitPrice: 1200, total: 3600, desc: "Shore power (3 days)", cat: "amenity" }] },
    /* Hatteras 48 */   { name: "Jack Simmons", vessel: "Freedom", loa: 48, beam: 16, draft: 7, slip: "T-17", arrivedWeeksAgo: 3, nights: 5, rate: 12500, amenities: [{ type: "fuel", qty: 40, unitPrice: 549, total: 21960, desc: "Diesel fuel (40 gal)", cat: "fuel", fuelType: "diesel" }, { type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }, { type: "pump_out", qty: 1, unitPrice: 1500, total: 1500, desc: "Pump-out service", cat: "amenity" }] },
    /* Sea Ray 28 */    { name: "Kelly O'Brien", vessel: "Daydream", loa: 28, beam: 9, draft: 3, slip: "T-6", arrivedWeeksAgo: 2, nights: 2, rate: 5500, amenities: [] },
    /* Catalina 38 */   { name: "Luis Hernandez", vessel: "Sol Mate", loa: 38, beam: 13, draft: 5, slip: "T-10", arrivedWeeksAgo: 2, nights: 3, rate: 8500, amenities: [{ type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }] },
    /* Beneteau 35 */   { name: "Megan Stone", vessel: "Windswept", loa: 35, beam: 12, draft: 5, slip: "T-8", arrivedWeeksAgo: 1, nights: 4, rate: 5500, amenities: [{ type: "shore_power", qty: 4, unitPrice: 1200, total: 4800, desc: "Shore power (4 days)", cat: "amenity" }, { type: "laundry", qty: 1, unitPrice: 500, total: 500, desc: "Laundry token", cat: "amenity" }] },
    /* Grady-White 30 */ { name: "Nathan Fox", vessel: "High Tide", loa: 30, beam: 10, draft: 4, slip: "T-7", arrivedWeeksAgo: 1, nights: 2, rate: 5500, amenities: [{ type: "fuel", qty: 8, unitPrice: 429, total: 3432, desc: "Gas fuel (8 gal)", cat: "fuel", fuelType: "gas" }] },
    /* Island Packet 45 */ { name: "Olivia Grant", vessel: "Destiny", loa: 45, beam: 15, draft: 7, slip: "T-19", arrivedWeeksAgo: 1, nights: 3, rate: 12500, amenities: [{ type: "shower", qty: 1, unitPrice: 300, total: 300, desc: "Shower token", cat: "amenity" }, { type: "fuel", qty: 15, unitPrice: 549, total: 8235, desc: "Diesel fuel (15 gal)", cat: "fuel", fuelType: "diesel" }] },
  ];

  let pastGuestCount = 0;

  for (const pg of pastGuests) {
    const arrivalDate = subDays(today, pg.arrivedWeeksAgo * 7);
    const checkOutDate = addDays(arrivalDate, pg.nights);
    const slip = slipMap.get(pg.slip)!;

    const [insertedGuest] = await db
      .insert(schema.guests)
      .values({
        name: pg.name,
        email: `${pg.name.toLowerCase().replace(/['\s]+/g, ".").replace(/\.\./g, ".")}@example.com`,
        phone: `555-3${String(pastGuestCount + 1).padStart(3, "0")}`,
        vesselName: pg.vessel,
        vesselLoa: pg.loa,
        vesselBeam: pg.beam,
        vesselDraft: pg.draft,
        createdAt: arrivalDate,
      })
      .returning();

    const [insertedStay] = await db
      .insert(schema.stays)
      .values({
        guestId: insertedGuest.id,
        slipId: slip.id,
        checkIn: arrivalDate,
        checkOut: checkOutDate,
        expectedDeparture: checkOutDate,
        status: "checked_out",
        gateCode: gateCode(),
        wifiPassword: wifiPass(pg.name.split(" ").pop()!),
        showerTokens: 3,
        showerTokensUsed: pg.amenities.filter((a) => a.type === "shower").length,
        nightlyRate: pg.rate,
        isPreBooked: Math.random() > 0.7,
        createdAt: arrivalDate,
      })
      .returning();

    // Past stay amenities
    for (let ai = 0; ai < pg.amenities.length; ai++) {
      const a = pg.amenities[ai];
      const amenityDate = addDays(arrivalDate, Math.min(ai + 1, pg.nights - 1));
      await db.insert(schema.amenityUsage).values({
        stayId: insertedStay.id,
        type: a.type,
        quantity: String(a.qty),
        unitPrice: a.unitPrice,
        totalAmount: a.total,
        fuelType: a.fuelType || null,
        createdAt: amenityDate,
      });
      await db.insert(schema.charges).values({
        stayId: insertedStay.id,
        description: a.desc,
        category: a.cat,
        amount: a.total,
        createdAt: amenityDate,
      });
      amenityCount++;
    }

    // Nightly charges for past stays
    for (let n = 0; n < pg.nights; n++) {
      await db.insert(schema.charges).values({
        stayId: insertedStay.id,
        description: "Nightly slip rate",
        category: "slip",
        amount: pg.rate,
        createdAt: addDays(arrivalDate, n),
      });
    }

    pastGuestCount++;
  }

  console.log(`  Past guests: ${pastGuestCount + 1} (including 1 repeat visitor)`);
  console.log(`  Total amenity records: ${amenityCount}`);

  // 10. Final slip status verification
  // T-4 = maintenance (set during creation)
  // Occupied slips with departing today already set
  // Available slips: T-7, T-8, T-14, T-15, T-19, T-20 (should be 6 available + 1 maintenance + 11 occupied + 2 departing = 20)
  // Actually: 13 occupied (12 + Sam Mitchell) - 2 of those departing = 11 occupied + 2 departing + 1 maintenance + 6 available = 20

  console.log("");
  console.log("Seed complete!");
  console.log(`  Users: ${insertedUsers.length}`);
  console.log(`  Slips: ${insertedSlips.length}`);
  console.log(`  Current guests: ${allCurrentGuests.length + 3} (${allCurrentGuests.length} checked-in, 3 arriving)`);
  console.log(`  Past guests: ${pastGuestCount + 1} (including 1 repeat)`);
  console.log(`  Amenity records: ${amenityCount}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
