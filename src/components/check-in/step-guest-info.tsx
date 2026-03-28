"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface StepGuestInfoProps {
  form: UseFormReturn<CheckInFormData>;
  onNext: () => void;
  isPreBooked?: boolean;
}

export function StepGuestInfo({ form, onNext, isPreBooked }: StepGuestInfoProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-4 p-1">
      {isPreBooked && (
        <div className="rounded-md bg-teal/10 border border-teal/30 px-3 py-2 text-sm text-teal">
          Pre-booked guest -- confirm details
        </div>
      )}

      {/* Guest Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guestName">Guest Name</Label>
        <Input
          id="guestName"
          placeholder="John Smith"
          className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
          {...register("guestName")}
        />
        {errors.guestName && (
          <span className="text-coral text-xs">{errors.guestName.message}</span>
        )}
      </div>

      {/* Vessel Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vesselName">Vessel Name</Label>
        <Input
          id="vesselName"
          placeholder="Sea Breeze"
          className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
          {...register("vesselName")}
        />
        {errors.vesselName && (
          <span className="text-coral text-xs">{errors.vesselName.message}</span>
        )}
      </div>

      {/* Dimensions: two-column grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loa">LOA (ft)</Label>
          <Input
            id="loa"
            type="number"
            placeholder="38"
            className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
            {...register("loa", { valueAsNumber: true })}
          />
          {errors.loa && (
            <span className="text-coral text-xs">{errors.loa.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="beam">Beam (ft)</Label>
          <Input
            id="beam"
            type="number"
            placeholder="12"
            className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
            {...register("beam", { valueAsNumber: true })}
          />
          {errors.beam && (
            <span className="text-coral text-xs">{errors.beam.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="draft">Draft (ft)</Label>
          <Input
            id="draft"
            type="number"
            placeholder="5"
            className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
            {...register("draft", { valueAsNumber: true })}
          />
          {errors.draft && (
            <span className="text-coral text-xs">{errors.draft.message}</span>
          )}
        </div>
      </div>

      {/* Contact fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="555-0123"
            className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
            {...register("phone")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="guest@example.com"
            className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-coral text-xs">{errors.email.message}</span>
          )}
        </div>
      </div>

      {/* Expected Nights */}
      <div className="flex flex-col gap-1.5 max-w-[120px]">
        <Label htmlFor="expectedNights">Nights</Label>
        <Input
          id="expectedNights"
          type="number"
          min={1}
          className="rounded-md border-fog focus:border-ocean focus:ring-ocean"
          {...register("expectedNights", { valueAsNumber: true })}
        />
        {errors.expectedNights && (
          <span className="text-coral text-xs">{errors.expectedNights.message}</span>
        )}
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onNext}
          className="bg-ocean hover:bg-ocean/90 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
