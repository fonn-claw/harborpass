"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { checkInSchema, type CheckInFormData } from "@/lib/schemas";
import { StepGuestInfo } from "./step-guest-info";
import { StepSlipSelect } from "./step-slip-select";
import { StepCredentials } from "./step-credentials";
import { toast } from "sonner";
import { checkInGuest } from "@/app/board/actions";

interface SlipData {
  id: number;
  name: string;
  maxLoa: number;
  maxBeam: number;
  waterDepth: number;
  size: "small" | "medium" | "large";
}

interface PreBookedStay {
  id: number;
  guestId: number;
  guest: {
    id: number;
    name: string;
    vesselName: string;
    vesselLoa: number;
    vesselBeam: number;
    vesselDraft: number;
    phone: string | null;
    email: string | null;
  };
  expectedDeparture: Date;
  nightlyRate: number;
}

interface CheckInWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSlips: SlipData[];
  preBookedStay?: PreBookedStay | null;
  preSelectedSlipId?: number | null;
}

interface CredentialsData {
  gateCode: string;
  wifiPassword: string;
  showerTokens: number;
}

export function CheckInWizard({
  open,
  onOpenChange,
  availableSlips,
  preBookedStay,
  preSelectedSlipId,
}: CheckInWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      guestName: "",
      vesselName: "",
      loa: undefined as unknown as number,
      beam: undefined as unknown as number,
      draft: undefined as unknown as number,
      phone: "",
      email: "",
      slipId: 0,
      expectedNights: 1,
    },
  });

  // Reset form when dialog opens with pre-booked or pre-selected data
  useEffect(() => {
    if (open) {
      setStep(1);
      setCredentials(null);
      setIsSubmitting(false);

      if (preBookedStay) {
        form.reset({
          guestName: preBookedStay.guest.name,
          vesselName: preBookedStay.guest.vesselName,
          loa: preBookedStay.guest.vesselLoa,
          beam: preBookedStay.guest.vesselBeam,
          draft: preBookedStay.guest.vesselDraft,
          phone: preBookedStay.guest.phone ?? "",
          email: preBookedStay.guest.email ?? "",
          slipId: preSelectedSlipId ?? 0,
          expectedNights: Math.max(
            1,
            Math.ceil(
              (new Date(preBookedStay.expectedDeparture).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          ),
          existingGuestId: preBookedStay.guestId,
          existingStayId: preBookedStay.id,
          isPreBooked: true,
        });
      } else {
        form.reset({
          guestName: "",
          vesselName: "",
          loa: undefined as unknown as number,
          beam: undefined as unknown as number,
          draft: undefined as unknown as number,
          phone: "",
          email: "",
          slipId: preSelectedSlipId ?? 0,
          expectedNights: 1,
        });
      }
    }
  }, [open, preBookedStay, preSelectedSlipId, form]);

  const handleClose = useCallback(() => {
    if (step === 3 && credentials) {
      // Credentials screen -- just close, check-in is done
      onOpenChange(false);
      return;
    }
    if (form.formState.isDirty) {
      if (window.confirm("Discard check-in?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  }, [step, credentials, form.formState.isDirty, onOpenChange]);

  const nextStep = useCallback(async () => {
    if (step === 1) {
      const valid = await form.trigger([
        "guestName",
        "vesselName",
        "loa",
        "beam",
        "draft",
      ]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger(["slipId"]);
      if (valid) setStep(3);
    }
  }, [step, form]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    const data = form.getValues();
    setIsSubmitting(true);

    try {
      const result = await checkInGuest(data);
      if (result.success) {
        setCredentials({
          gateCode: result.gateCode!,
          wifiPassword: result.wifiPassword!,
          showerTokens: result.showerTokens!,
        });
        toast.success("Guest checked in successfully");
      } else {
        toast.error(`Check-in failed: ${result.error ?? "Unknown error"}`);
      }
    } catch {
      toast.error("An unexpected error occurred during check-in");
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  // Find selected slip name for credentials display
  const selectedSlipId = form.watch("slipId");
  const selectedSlip = availableSlips.find((s) => s.id === selectedSlipId);
  const slipName = selectedSlip?.name ?? "";

  // Progress dots
  const dots = [1, 2, 3];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-2xl"
        showCloseButton={step !== 3 || !credentials}
      >
        <DialogTitle className="font-heading text-navy">
          {step === 3 && credentials ? "Check-In Complete" : "Check In Guest"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          3-step check-in wizard for marina guest registration
        </DialogDescription>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {dots.map((d) => (
            <div
              key={d}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                d === step
                  ? "bg-ocean"
                  : d < step
                    ? "bg-teal"
                    : "border-2 border-fog bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Step content with slide transition */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            {/* Step 1 */}
            <div className="w-full flex-shrink-0">
              <StepGuestInfo
                form={form}
                onNext={nextStep}
                isPreBooked={!!preBookedStay}
              />
            </div>

            {/* Step 2 */}
            <div className="w-full flex-shrink-0">
              <StepSlipSelect
                form={form}
                availableSlips={availableSlips}
                onNext={nextStep}
                onBack={prevStep}
              />
            </div>

            {/* Step 3 */}
            <div className="w-full flex-shrink-0">
              <StepCredentials
                credentials={credentials}
                formData={{
                  guestName: form.watch("guestName"),
                  vesselName: form.watch("vesselName"),
                }}
                slipName={slipName}
                onComplete={() => onOpenChange(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
