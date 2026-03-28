"use server";

import { db } from "@/db";
import { guests, stays, slips, pricing } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { generateGateCode, generateWifiPassword } from "@/lib/credentials";
import { checkInSchema, type CheckInFormData } from "@/lib/schemas";

interface CheckInResult {
  success: boolean;
  gateCode?: string;
  wifiPassword?: string;
  showerTokens?: number;
  error?: string;
}

export async function checkInGuest(data: CheckInFormData): Promise<CheckInResult> {
  try {
    const parsed = checkInSchema.parse(data);

    const lastName = parsed.guestName.split(" ").pop() ?? "guest";
    const gateCode = generateGateCode();
    const wifiPassword = generateWifiPassword(lastName);
    const showerTokens = 3;

    if (parsed.existingGuestId && parsed.existingStayId) {
      // Pre-booked flow: update existing stay
      await db
        .update(stays)
        .set({
          status: "checked_in",
          slipId: parsed.slipId,
          gateCode,
          wifiPassword,
          showerTokens,
          showerTokensUsed: 0,
        })
        .where(eq(stays.id, parsed.existingStayId));

      // Update slip status to occupied
      await db
        .update(slips)
        .set({ status: "occupied" })
        .where(eq(slips.id, parsed.slipId));
    } else {
      // Walk-up flow: insert new guest and stay

      // Insert guest
      const [newGuest] = await db
        .insert(guests)
        .values({
          name: parsed.guestName,
          vesselName: parsed.vesselName,
          vesselLoa: parsed.loa,
          vesselBeam: parsed.beam,
          vesselDraft: parsed.draft,
          phone: parsed.phone ?? null,
          email: parsed.email || null,
        })
        .returning({ id: guests.id });

      // Look up nightly rate from pricing table
      // Find the slip to determine its size
      const [slip] = await db
        .select()
        .from(slips)
        .where(eq(slips.id, parsed.slipId))
        .limit(1);

      let nightlyRate = 7500; // Default $75/night in cents
      if (slip) {
        const [pricingRow] = await db
          .select()
          .from(pricing)
          .where(eq(pricing.category, "slip"))
          .limit(1);

        if (pricingRow) {
          // Try to find size-specific pricing
          const allSlipPricing = await db
            .select()
            .from(pricing)
            .where(eq(pricing.category, "slip"));

          const sizeMatch = allSlipPricing.find(
            (p) => p.name.toLowerCase() === slip.size
          );
          if (sizeMatch) {
            nightlyRate = sizeMatch.rate;
          } else if (pricingRow) {
            nightlyRate = pricingRow.rate;
          }
        }
      }

      // Calculate expected departure
      const now = new Date();
      const expectedDeparture = addDays(now, parsed.expectedNights);

      // Insert stay
      await db.insert(stays).values({
        guestId: newGuest.id,
        slipId: parsed.slipId,
        checkIn: now,
        expectedDeparture,
        status: "checked_in",
        gateCode,
        wifiPassword,
        showerTokens,
        showerTokensUsed: 0,
        nightlyRate,
        isPreBooked: false,
      });

      // Update slip status to occupied
      await db
        .update(slips)
        .set({ status: "occupied" })
        .where(eq(slips.id, parsed.slipId));
    }

    revalidatePath("/board");

    return {
      success: true,
      gateCode,
      wifiPassword,
      showerTokens,
    };
  } catch (err) {
    console.error("Check-in failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Check-in failed",
    };
  }
}
