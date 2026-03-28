"use client";

import { useState, useCallback } from "react";
import { BoardColumn } from "./board-column";
import { DockStrip } from "./dock-strip";
import { CheckInWizard } from "@/components/check-in/check-in-wizard";
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
      } else {
        // Occupied/departing slips -- placeholder for future detail panel
        console.log("Slip clicked:", slip.name, slip.status);
      }
    },
    []
  );

  // Placeholders for Plan 03
  const handleViewStay = useCallback((stay: StayData) => {
    console.log("View stay:", stay.id, stay.guest.name);
  }, []);

  const handleSettle = useCallback((stay: StayData) => {
    console.log("Settle:", stay.id, stay.guest.name);
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
        />
      </div>

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
