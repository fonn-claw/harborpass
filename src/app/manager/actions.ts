"use server";

import { db } from "@/db";
import { pricing } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function updatePricingRate(
  id: number,
  newRate: number
): Promise<UpdateResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: "Invalid pricing ID" };
    }
    if (!Number.isInteger(newRate) || newRate < 0) {
      return { success: false, error: "Rate must be a non-negative integer (cents)" };
    }

    await db
      .update(pricing)
      .set({ rate: newRate, updatedAt: new Date() })
      .where(eq(pricing.id, id));

    revalidatePath("/manager");

    return { success: true };
  } catch (err) {
    console.error("Failed to update pricing:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update pricing",
    };
  }
}
