import { db } from "@/db";
import { stays, slips, users, guests, charges, pricing } from "@/db/schema";
import { eq, and, or, gte, lte, sql, desc } from "drizzle-orm";
import { startOfDay, endOfDay, differenceInCalendarDays, startOfMonth } from "date-fns";

// ---- Types ----

type StayWithRelations = Awaited<ReturnType<typeof fetchActiveStays>>[number];

export interface BoardData {
  arriving: StayWithRelations[];
  checkedIn: StayWithRelations[];
  departingToday: StayWithRelations[];
}

// SlipWithStay type is inferred after getAllSlips definition below

// ---- Queries ----

async function fetchActiveStays() {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  return db.query.stays.findMany({
    where: or(
      eq(stays.status, "checked_in"),
      and(
        eq(stays.status, "reserved"),
        gte(stays.checkIn, dayStart),
        lte(stays.checkIn, dayEnd)
      )
    ),
    with: {
      guest: true,
      slip: true,
      amenityUsages: true,
      charges: {
        orderBy: (ch, { asc }) => [asc(ch.createdAt)],
      },
    },
  });
}

export async function getBoardData(): Promise<BoardData> {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const allStays = await fetchActiveStays();

  const arriving: StayWithRelations[] = [];
  const checkedIn: StayWithRelations[] = [];
  const departingToday: StayWithRelations[] = [];

  for (const stay of allStays) {
    if (stay.status === "reserved") {
      arriving.push(stay);
    } else if (
      stay.expectedDeparture >= dayStart &&
      stay.expectedDeparture <= dayEnd
    ) {
      departingToday.push(stay);
    } else {
      checkedIn.push(stay);
    }
  }

  // Sort each group
  arriving.sort(
    (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  );
  checkedIn.sort(
    (a, b) =>
      new Date(a.expectedDeparture).getTime() -
      new Date(b.expectedDeparture).getTime()
  );
  departingToday.sort(
    (a, b) =>
      new Date(a.expectedDeparture).getTime() -
      new Date(b.expectedDeparture).getTime()
  );

  return { arriving, checkedIn, departingToday };
}

export async function getAllSlips() {
  const result = await db.query.slips.findMany({
    orderBy: (slips, { asc }) => [asc(slips.name)],
    with: {
      stays: {
        where: or(eq(stays.status, "checked_in"), eq(stays.status, "reserved")),
        with: {
          guest: true,
        },
        limit: 1,
      },
    },
  });

  return result;
}

export type SlipWithStay = Awaited<ReturnType<typeof getAllSlips>>[number];

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
        orderBy: (ch, { desc }) => [desc(ch.createdAt)],
      },
    },
  });
}

export async function getSettlementData(stayId: number) {
  const stay = await db.query.stays.findFirst({
    where: eq(stays.id, stayId),
    with: {
      guest: true,
      slip: true,
      charges: {
        orderBy: (ch, { asc }) => [asc(ch.createdAt)],
      },
    },
  });

  if (!stay) return null;

  const nightCount = differenceInCalendarDays(new Date(), stay.checkIn);
  const totalAmount = stay.charges.reduce((sum, ch) => sum + ch.amount, 0);

  return { ...stay, nightCount, totalAmount };
}

export type SettlementData = NonNullable<Awaited<ReturnType<typeof getSettlementData>>>;

export async function getAvailableSlips() {
  return db.query.slips.findMany({
    where: eq(slips.status, "available"),
    orderBy: (slips, { asc }) => [asc(slips.name)],
  });
}

// ---- Guest Portal ----

// ---- Manager Queries ----

export interface OccupancyStats {
  occupied: number;
  available: number;
  departingToday: number;
  maintenance: number;
  total: number;
}

export async function getOccupancyStats(): Promise<OccupancyStats> {
  const rows = await db
    .select({
      status: slips.status,
      count: sql<number>`count(*)::int`,
    })
    .from(slips)
    .groupBy(slips.status);

  const stats: OccupancyStats = {
    occupied: 0,
    available: 0,
    departingToday: 0,
    maintenance: 0,
    total: 20,
  };

  for (const row of rows) {
    switch (row.status) {
      case "occupied":
        stats.occupied = row.count;
        break;
      case "available":
        stats.available = row.count;
        break;
      case "departing_today":
        stats.departingToday = row.count;
        break;
      case "maintenance":
        stats.maintenance = row.count;
        break;
    }
  }

  return stats;
}

export interface RevenueBreakdown {
  categories: { category: string; total: number }[];
  grandTotal: number;
}

export async function getRevenueBreakdown(): Promise<RevenueBreakdown> {
  const monthStart = startOfMonth(new Date());

  const rows = await db
    .select({
      category: charges.category,
      total: sql<number>`sum(${charges.amount})::int`,
    })
    .from(charges)
    .where(gte(charges.createdAt, monthStart))
    .groupBy(charges.category)
    .orderBy(sql`sum(${charges.amount}) desc`);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return { categories: rows, grandTotal };
}

export interface GuestHistoryEntry {
  stayId: number;
  guestId: number;
  guestName: string;
  vesselName: string;
  vesselLoa: number;
  slipName: string | null;
  checkIn: Date;
  checkOut: Date | null;
  status: string;
  totalCharges: number;
  stayCount: number;
  charges: { description: string; category: string; amount: number; createdAt: Date }[];
}

export async function getGuestHistory(): Promise<GuestHistoryEntry[]> {
  const allStays = await db.query.stays.findMany({
    with: {
      guest: true,
      slip: true,
      charges: {
        orderBy: (ch, { asc }) => [asc(ch.createdAt)],
      },
    },
    orderBy: (s, { desc }) => [desc(s.checkIn)],
  });

  // Count stays per guest
  const stayCountMap = new Map<number, number>();
  for (const s of allStays) {
    stayCountMap.set(s.guestId, (stayCountMap.get(s.guestId) || 0) + 1);
  }

  return allStays.map((s) => ({
    stayId: s.id,
    guestId: s.guestId,
    guestName: s.guest.name,
    vesselName: s.guest.vesselName,
    vesselLoa: s.guest.vesselLoa,
    slipName: s.slip?.name ?? null,
    checkIn: s.checkIn,
    checkOut: s.checkOut,
    status: s.status,
    totalCharges: s.charges.reduce((sum, ch) => sum + ch.amount, 0),
    stayCount: stayCountMap.get(s.guestId) || 1,
    charges: s.charges.map((ch) => ({
      description: ch.description,
      category: ch.category,
      amount: ch.amount,
      createdAt: ch.createdAt,
    })),
  }));
}

// ---- Pricing ----

export async function getAllPricing() {
  return db.select().from(pricing).orderBy(pricing.category, pricing.name);
}

export type PricingEntry = Awaited<ReturnType<typeof getAllPricing>>[number];

export async function getGuestPortalData(userId: number) {
  // Step 1: Get user email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;

  // Step 2: Find guest by email
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.email, user.email))
    .limit(1);
  if (!guest) return null;

  // Step 3: Find active stay with relations
  const stay = await db.query.stays.findFirst({
    where: and(eq(stays.guestId, guest.id), eq(stays.status, "checked_in")),
    with: {
      slip: true,
      amenityUsages: {
        orderBy: (au, { desc }) => [desc(au.createdAt)],
      },
      charges: {
        orderBy: (c, { asc }) => [asc(c.createdAt)],
      },
    },
  });

  return stay ? { guest, ...stay } : null;
}
