import { db } from "@/db";
import { stays, slips, users, guests } from "@/db/schema";
import { eq, and, or, gte, lte } from "drizzle-orm";
import { startOfDay, endOfDay, differenceInCalendarDays } from "date-fns";

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
