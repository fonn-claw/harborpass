"use client";

import { BoardColumn } from "./board-column";
import { DockStrip } from "./dock-strip";
import type { BoardData, SlipWithStay } from "@/lib/queries";

interface DispatchBoardProps {
  data: BoardData;
  slips: SlipWithStay[];
}

export function DispatchBoard({ data, slips }: DispatchBoardProps) {
  // Placeholder click handlers -- wizard/detail panels added in Plan 02/03
  const handleCheckIn = (stay: BoardData["arriving"][number]) => {
    console.log("Check in:", stay.id, stay.guest.name);
  };

  const handleViewStay = (stay: BoardData["arriving"][number]) => {
    console.log("View stay:", stay.id, stay.guest.name);
  };

  const handleSettle = (stay: BoardData["arriving"][number]) => {
    console.log("Settle:", stay.id, stay.guest.name);
  };

  const handleSlipClick = (slip: SlipWithStay) => {
    console.log("Slip clicked:", slip.name, slip.status);
  };

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
    </div>
  );
}
