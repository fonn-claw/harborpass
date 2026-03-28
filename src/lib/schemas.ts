import { z } from "zod";

export const checkInSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  vesselName: z.string().min(1, "Vessel name is required"),
  loa: z.number().min(1, "LOA must be at least 1 foot"),
  beam: z.number().min(1, "Beam must be at least 1 foot"),
  draft: z.number().min(1, "Draft must be at least 1 foot"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  slipId: z.number(),
  expectedNights: z.number().min(1, "Stay must be at least 1 night").default(1),
  existingGuestId: z.number().optional(),
  existingStayId: z.number().optional(),
  isPreBooked: z.boolean().optional(),
});

export type CheckInFormData = z.infer<typeof checkInSchema>;
