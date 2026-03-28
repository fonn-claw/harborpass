"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BoardData } from "@/lib/queries";

type StayData = BoardData["arriving"][number];

type StatusVariant = "arriving" | "checked_in" | "departing";

interface GuestCardProps {
  stay: StayData;
  variant: StatusVariant;
  onCheckIn?: (stay: StayData) => void;
  onViewStay?: (stay: StayData) => void;
  onSettle?: (stay: StayData) => void;
}

const stripeColor: Record<StatusVariant, string> = {
  arriving: "bg-teal",
  checked_in: "bg-ocean",
  departing: "bg-rope",
};

const amenityIcons: Record<string, string> = {
  shower: "/assets/icon-shower.svg",
  fuel: "/assets/icon-fuel.svg",
  shore_power: "/assets/icon-power.svg",
  pump_out: "/assets/icon-pump-out.svg",
  laundry: "/assets/icon-laundry.svg",
};

const amenityLabels: Record<string, string> = {
  shower: "Shower",
  fuel: "Fuel",
  shore_power: "Power",
  pump_out: "Pump-out",
  laundry: "Laundry",
};

export function GuestCard({
  stay,
  variant,
  onCheckIn,
  onViewStay,
  onSettle,
}: GuestCardProps) {
  const guest = stay.guest;
  const slip = stay.slip;

  // Derive unique amenity type counts
  const amenityCounts = new Map<string, number>();
  for (const usage of stay.amenityUsages) {
    const count = amenityCounts.get(usage.type) ?? 0;
    amenityCounts.set(usage.type, count + 1);
  }

  const timeInfo = (() => {
    if (variant === "arriving") {
      return `Arriving ${format(new Date(stay.checkIn), "h:mm a")}`;
    }
    if (variant === "departing") {
      return `Departs ${format(new Date(stay.expectedDeparture), "MMM d")}`;
    }
    return `Departs ${format(new Date(stay.expectedDeparture), "MMM d")}`;
  })();

  const handleClick = () => {
    if (variant === "arriving") onCheckIn?.(stay);
    else if (variant === "checked_in") onViewStay?.(stay);
    else onViewStay?.(stay); // Departing: card click opens detail, Settle button handles settlement
  };

  const actionLabel =
    variant === "arriving"
      ? "Check In"
      : variant === "checked_in"
        ? "View Stay"
        : "Settle";

  const actionColorClass =
    variant === "arriving"
      ? "bg-teal hover:bg-teal/90 text-white"
      : variant === "checked_in"
        ? "bg-ocean hover:bg-ocean/90 text-white"
        : "bg-rope hover:bg-rope/90 text-white";

  return (
    <div
      className="flex rounded-lg border border-fog bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150"
      onClick={handleClick}
    >
      {/* Left color stripe */}
      <div className={`w-1 shrink-0 ${stripeColor[variant]}`} />

      {/* Card content */}
      <div className="flex-1 px-3 py-2.5 min-w-0">
        {/* Row 1: Vessel name + slip */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src="/assets/icon-boat.svg"
              alt=""
              width={16}
              height={16}
              className="shrink-0 opacity-70"
            />
            <span className="font-heading font-semibold text-navy text-sm truncate">
              {guest.vesselName}
            </span>
          </div>
          {slip && (
            <span className="font-mono text-xs text-slate shrink-0">
              {slip.name}
            </span>
          )}
        </div>

        {/* Row 2: Guest name + dimensions */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-slate truncate">{guest.name}</span>
          <span className="text-xs text-slate/70">
            {guest.vesselLoa}&apos; x {guest.vesselBeam}&apos;
          </span>
        </div>

        {/* Row 3: Time info + amenity badges */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-slate">{timeInfo}</span>
            {amenityCounts.size > 0 && (
              <div className="flex items-center gap-1">
                {Array.from(amenityCounts.entries()).map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="h-4 px-1 gap-0.5 text-[10px] bg-fog/60 text-slate"
                  >
                    <img
                      src={amenityIcons[type] ?? "/assets/icon-token.svg"}
                      alt=""
                      width={10}
                      height={10}
                      className="opacity-60"
                    />
                    {count > 1 ? count : amenityLabels[type] ?? type}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action button */}
          <Button
            size="xs"
            className={`shrink-0 ${actionColorClass}`}
            onClick={(e) => {
              e.stopPropagation();
              if (variant === "departing") {
                onSettle?.(stay);
              } else {
                handleClick();
              }
            }}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
