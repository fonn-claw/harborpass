"use server";

import { db } from "@/db";
import { guests, stays, slips, pricing, amenityUsage, charges } from "@/db/schema";
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

// ---- Settlement ----

interface SettleResult {
  success: boolean;
  error?: string;
}

export async function settleAccount(stayId: number): Promise<SettleResult> {
  try {
    // Step 1: Get the stay to find slipId
    const [stay] = await db
      .select()
      .from(stays)
      .where(eq(stays.id, stayId))
      .limit(1);

    if (!stay) return { success: false, error: "Stay not found" };

    // Step 2: Update stay to checked_out
    await db
      .update(stays)
      .set({ status: "checked_out", checkOut: new Date() })
      .where(eq(stays.id, stayId));

    // Step 3: Release slip
    if (stay.slipId) {
      await db
        .update(slips)
        .set({ status: "available" })
        .where(eq(slips.id, stay.slipId));
    }

    // Step 4: Refresh board
    revalidatePath("/board");

    return { success: true };
  } catch (err) {
    console.error("Settlement failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Settlement failed",
    };
  }
}

// ---- Amenity Logging ----

type AmenityInput =
  | { type: "shower"; stayId: number }
  | { type: "fuel"; stayId: number; gallons: number; fuelType: "diesel" | "gas" }
  | { type: "shore_power"; stayId: number; kWh: number }
  | { type: "pump_out"; stayId: number }
  | { type: "laundry"; stayId: number };

interface AmenityResult {
  success: boolean;
  message: string;
}

export async function logAmenity(input: AmenityInput): Promise<AmenityResult> {
  try {
    // Load all pricing rows once
    const allPricing = await db.select().from(pricing);
    function findPrice(name: string, fallback: number): number {
      const row = allPricing.find((p) => p.name === name);
      return row ? row.rate : fallback;
    }

    if (input.type === "shower") {
      // Get current stay for shower token tracking
      const [stay] = await db
        .select()
        .from(stays)
        .where(eq(stays.id, input.stayId))
        .limit(1);

      if (!stay) return { success: false, message: "Stay not found" };

      const isFree = stay.showerTokensUsed < stay.showerTokens;
      const showerPrice = findPrice("Shower Token", 300);
      const totalAmount = isFree ? 0 : showerPrice;

      // Increment showerTokensUsed
      await db
        .update(stays)
        .set({ showerTokensUsed: stay.showerTokensUsed + 1 })
        .where(eq(stays.id, input.stayId));

      // Create amenity usage
      await db.insert(amenityUsage).values({
        stayId: input.stayId,
        type: "shower",
        quantity: "1",
        unitPrice: showerPrice,
        totalAmount,
        fuelType: null,
      });

      // Create charge only if not free
      if (totalAmount > 0) {
        await db.insert(charges).values({
          stayId: input.stayId,
          description: "Shower token (paid)",
          category: "amenity",
          amount: totalAmount,
        });
      }

      revalidatePath("/board");
      return {
        success: true,
        message: isFree
          ? `Shower (included token ${stay.showerTokensUsed + 1}/${stay.showerTokens})`
          : "Shower token (paid $3.00)",
      };
    }

    if (input.type === "fuel") {
      const fuelName = input.fuelType === "diesel" ? "Diesel" : "Gas";
      const unitPrice = findPrice(fuelName, input.fuelType === "diesel" ? 549 : 429);
      const totalAmount = Math.round(unitPrice * input.gallons);

      await db.insert(amenityUsage).values({
        stayId: input.stayId,
        type: "fuel",
        quantity: String(input.gallons),
        unitPrice,
        totalAmount,
        fuelType: input.fuelType,
      });

      await db.insert(charges).values({
        stayId: input.stayId,
        description: `${fuelName} fuel (${input.gallons} gal)`,
        category: "fuel",
        amount: totalAmount,
      });

      revalidatePath("/board");
      return {
        success: true,
        message: `${input.gallons} gal ${fuelName.toLowerCase()} logged`,
      };
    }

    if (input.type === "shore_power") {
      // Per CONTEXT.md: $0.12/kWh (12 cents)
      const unitPrice = 12;
      const totalAmount = Math.round(unitPrice * input.kWh);

      await db.insert(amenityUsage).values({
        stayId: input.stayId,
        type: "shore_power",
        quantity: String(input.kWh),
        unitPrice,
        totalAmount,
        fuelType: null,
      });

      await db.insert(charges).values({
        stayId: input.stayId,
        description: `Shore power (${input.kWh} kWh)`,
        category: "amenity",
        amount: totalAmount,
      });

      revalidatePath("/board");
      return { success: true, message: `${input.kWh} kWh shore power logged` };
    }

    if (input.type === "pump_out") {
      const unitPrice = findPrice("Pump-out", 1500);

      await db.insert(amenityUsage).values({
        stayId: input.stayId,
        type: "pump_out",
        quantity: "1",
        unitPrice,
        totalAmount: unitPrice,
        fuelType: null,
      });

      await db.insert(charges).values({
        stayId: input.stayId,
        description: "Pump-out service",
        category: "amenity",
        amount: unitPrice,
      });

      revalidatePath("/board");
      return { success: true, message: "Pump-out logged" };
    }

    if (input.type === "laundry") {
      const unitPrice = findPrice("Laundry Token", 500);

      await db.insert(amenityUsage).values({
        stayId: input.stayId,
        type: "laundry",
        quantity: "1",
        unitPrice,
        totalAmount: unitPrice,
        fuelType: null,
      });

      await db.insert(charges).values({
        stayId: input.stayId,
        description: "Laundry token",
        category: "amenity",
        amount: unitPrice,
      });

      revalidatePath("/board");
      return { success: true, message: "Laundry logged" };
    }

    return { success: false, message: "Unknown amenity type" };
  } catch (err) {
    console.error("Failed to log amenity:", err);
    return { success: false, message: "Failed to log amenity" };
  }
}
