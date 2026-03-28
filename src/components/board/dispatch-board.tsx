"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { BoardColumn } from "./board-column";
import { DockStrip } from "./dock-strip";
import { CheckInWizard } from "@/components/check-in/check-in-wizard";
import { GuestDetailPanel } from "./guest-detail-panel";
import { toast } from "sonner";
import type { BoardData, SlipWithStay } from "@/lib/queries";

type StayData = BoardData["arriving"][number];

interface DispatchBoardProps {
  data: BoardData;
  slips: SlipWithStay[];
}

export function DispatchBoard({ data, slips }: DispatchBoardProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState<StayData | null>(null);
  const [preSelectedSlipId, setPreSelectedSlipId] = useState<number | null>(null);
  const [detailStayId, setDetailStayId] = useState<number | null>(null);

  // Flatten all stays for the detail panel
  const allStays = useMemo(
    () => [...data.arriving, ...data.checkedIn, ...data.departingToday],
    [data]
  );

  // Listen for top bar "Check In" button custom event
  useEffect(() => {
    const handler = () => {
      setSelectedStay(null);
      setPreSelectedSlipId(null);
      setWizardOpen(true);
    };
    window.addEventListener("open-checkin-wizard", handler);
    return () => window.removeEventListener("open-checkin-wizard", handler);
  }, []);

  // Derive available slips from props
  const availableSlips = slips
    .filter((s) => s.status === "available")
    .map((s) => ({
      id: s.id,
      name: s.name,
      maxLoa: s.maxLoa,
      maxBeam: s.maxBeam,
      waterDepth: s.waterDepth,
      size: s.size,
    }));

  // Check-in from arriving card
  const handleCheckIn = useCallback((stay: StayData) => {
    setSelectedStay(stay);
    setPreSelectedSlipId(null);
    setWizardOpen(true);
  }, []);

  // Check-in from dock strip (available slip click)
  const handleSlipClick = useCallback(
    (slip: SlipWithStay) => {
      if (slip.status === "available") {
        setSelectedStay(null);
        setPreSelectedSlipId(slip.id);
        setWizardOpen(true);
      } else if (slip.status === "occupied" || slip.status === "departing_today") {
        // Find the stay associated with this slip
        const matchedStay = allStays.find((s) => s.slip?.id === slip.id);
        if (matchedStay) {
          setDetailStayId(matchedStay.id);
        }
      }
    },
    []
  );

  // Open guest detail slide-over
  const handleViewStay = useCallback((stay: StayData) => {
    setDetailStayId(stay.id);
  }, []);

  const handleSettle = useCallback((stay: StayData) => {
    toast("Settlement coming in Phase 3", {
      description: `${stay.guest.name} - ${stay.guest.vesselName}`,
    });
  }, []);

  // Close wizard and reset state
  const handleWizardClose = useCallback((open: boolean) => {
    if (!open) {
      setWizardOpen(false);
      setSelectedStay(null);
      setPreSelectedSlipId(null);
    }
  }, []);

  // Derive pre-booked stay data for the wizard
  const preBookedStay =
    selectedStay && selectedStay.status === "reserved" && selectedStay.isPreBooked
      ? {
          id: selectedStay.id,
          guestId: selectedStay.guestId,
          guest: {
            id: selectedStay.guest.id,
            name: selectedStay.guest.name,
            vesselName: selectedStay.guest.vesselName,
            vesselLoa: selectedStay.guest.vesselLoa,
            vesselBeam: selectedStay.guest.vesselBeam,
            vesselDraft: selectedStay.guest.vesselDraft,
            phone: selectedStay.guest.phone,
            email: selectedStay.guest.email,
          },
          expectedDeparture: selectedStay.expectedDeparture,
          nightlyRate: selectedStay.nightlyRate,
        }
      : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Dock strip -- full width at top */}
      <DockStrip slips={slips} onSlipClick={handleSlipClick} />

      {/* Three swim-lane columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-fog overflow-hidden pt-2">
        <BoardColumn
          title="Arriving Today"
          count={data.arriving.length}
          stays={data.arriving}
          variant="arriving"
          onCheckIn={handleCheckIn}
        />
        <BoardColumn
          title="Checked In"
          count={data.checkedIn.length}
          stays={data.checkedIn}
          variant="checked_in"
          onViewStay={handleViewStay}
        />
        <BoardColumn
          title="Departing Today"
          count={data.departingToday.length}
          stays={data.departingToday}
          variant="departing"
          onSettle={handleSettle}
          onViewStay={handleViewStay}
        />
      </div>

      {/* Guest detail slide-over */}
      <GuestDetailPanel
        stayId={detailStayId}
        stays={allStays}
        open={detailStayId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailStayId(null);
        }}
      />

      {/* Check-in wizard */}
      <CheckInWizard
        open={wizardOpen}
        onOpenChange={handleWizardClose}
        availableSlips={availableSlips}
        preBookedStay={preBookedStay}
        preSelectedSlipId={preSelectedSlipId}
      />
    </div>
  );
}
