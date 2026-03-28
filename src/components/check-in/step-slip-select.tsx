"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";

interface SlipData {
  id: number;
  name: string;
  maxLoa: number;
  maxBeam: number;
  waterDepth: number;
  size: "small" | "medium" | "large";
}

interface StepSlipSelectProps {
  form: UseFormReturn<CheckInFormData>;
  availableSlips: SlipData[];
  onNext: () => void;
  onBack: () => void;
}

export function StepSlipSelect({
  form,
  availableSlips,
  onNext,
  onBack,
}: StepSlipSelectProps) {
  const vesselLoa = form.watch("loa") || 0;
  const vesselBeam = form.watch("beam") || 0;
  const vesselDraft = form.watch("draft") || 0;
  const selectedSlipId = form.watch("slipId");

  return (
    <div className="flex flex-col gap-4 p-1">
      <p className="text-sm text-slate">
        Select a slip for the vessel ({vesselLoa}&apos; LOA, {vesselBeam}&apos; beam, {vesselDraft}&apos; draft)
      </p>

      {/* Slip grid */}
      <div className="flex flex-wrap gap-2">
        {availableSlips.map((slip) => {
          const fits =
            slip.maxLoa >= vesselLoa &&
            slip.maxBeam >= vesselBeam &&
            slip.waterDepth >= vesselDraft;
          const isSelected = selectedSlipId === slip.id;

          return (
            <button
              key={slip.id}
              type="button"
              disabled={!fits}
              onClick={() => {
                if (fits) {
                  form.setValue("slipId", slip.id, { shouldValidate: true });
                }
              }}
              className={`
                flex flex-col items-center justify-center rounded-md transition-colors
                ${
                  isSelected
                    ? "bg-teal text-white border-2 border-teal"
                    : fits
                      ? "bg-teal/10 border-2 border-teal cursor-pointer hover:bg-teal/20"
                      : "bg-fog/50 border border-fog text-slate/50 cursor-not-allowed"
                }
              `}
              style={{ width: 80, height: 60 }}
            >
              <span className="font-mono font-semibold text-sm">{slip.name}</span>
              <span
                className={`text-[10px] ${isSelected ? "text-white/80" : fits ? "text-slate" : "text-slate/40"}`}
              >
                {slip.maxLoa}&apos; x {slip.maxBeam}&apos;
              </span>
              {!fits && (
                <span className="text-[9px] text-slate/40">Too small</span>
              )}
            </button>
          );
        })}
      </div>

      {availableSlips.length === 0 && (
        <div className="text-sm text-slate text-center py-6">
          No available slips
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!selectedSlipId}
          className="bg-ocean hover:bg-ocean/90 text-white disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
