"use client";

import { GuestCard } from "./guest-card";
import type { BoardData } from "@/lib/queries";

type StayData = BoardData["arriving"][number];
type StatusVariant = "arriving" | "checked_in" | "departing";

interface BoardColumnProps {
  title: string;
  count: number;
  stays: StayData[];
  variant: StatusVariant;
  onCheckIn?: (stay: StayData) => void;
  onViewStay?: (stay: StayData) => void;
  onSettle?: (stay: StayData) => void;
}

export function BoardColumn({
  title,
  count,
  stays,
  variant,
  onCheckIn,
  onViewStay,
  onSettle,
}: BoardColumnProps) {
  return (
    <div className="flex flex-col min-w-0 min-h-0">
      {/* Column header */}
      <div className="px-3 py-2.5">
        <h2 className="font-heading font-semibold text-navy text-base">
          {title}{" "}
          <span className="text-slate font-normal">({count})</span>
        </h2>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 flex flex-col gap-2 px-2 pb-4 overflow-y-auto min-h-0">
        {stays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <img
              src="/assets/empty-board.svg"
              alt=""
              width={120}
              height={80}
              className="opacity-40"
            />
            <span className="text-sm text-slate">No guests</span>
          </div>
        ) : (
          stays.map((stay) => (
            <GuestCard
              key={stay.id}
              stay={stay}
              variant={variant}
              onCheckIn={onCheckIn}
              onViewStay={onViewStay}
              onSettle={onSettle}
            />
          ))
        )}
      </div>
    </div>
  );
}
