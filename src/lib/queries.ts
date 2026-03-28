import { db } from "@/db";
import { stays, slips } from "@/db/schema";
import { eq, and, or, gte, lte } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

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

export async function getAvailableSlips() {
  return db.query.slips.findMany({
    where: eq(slips.status, "available"),
    orderBy: (slips, { asc }) => [asc(slips.name)],
  });
}
