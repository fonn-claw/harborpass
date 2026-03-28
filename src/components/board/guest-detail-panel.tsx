"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AmenityLogger } from "./amenity-logger";
import { formatCurrency } from "@/lib/format";
import { format, differenceInCalendarDays } from "date-fns";
import type { BoardData } from "@/lib/queries";

type StayData = BoardData["arriving"][number];

interface GuestDetailPanelProps {
  stayId: number | null;
  stays: StayData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  shore_power: "Shore Power",
  pump_out: "Pump-out",
  laundry: "Laundry",
};

export function GuestDetailPanel({
  stayId,
  stays,
  open,
  onOpenChange,
}: GuestDetailPanelProps) {
  const stay = stayId ? stays.find((s) => s.id === stayId) : null;

  if (!stay) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Guest Detail</SheetTitle>
            <SheetDescription>No stay selected</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const guest = stay.guest;
  const slip = stay.slip;
  const today = new Date();
  const nightsRemaining = differenceInCalendarDays(
    new Date(stay.expectedDeparture),
    today
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[400px] overflow-y-auto">
        {/* Header */}
        <SheetHeader className="pb-0">
          <SheetTitle className="font-heading text-navy font-bold text-lg">
            {guest.name}
          </SheetTitle>
          <SheetDescription className="text-sm text-slate">
            {guest.vesselName} &mdash; {guest.vesselLoa}&apos; x{" "}
            {guest.vesselBeam}&apos;
          </SheetDescription>
          {slip && (
            <span className="inline-flex w-fit font-mono text-sm bg-ocean/10 text-ocean rounded px-2 py-0.5">
              {slip.name}
            </span>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <Separator />

          {/* Stay Info */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-heading font-semibold text-navy uppercase tracking-wide">
              Stay Info
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate text-xs">Check-in</span>
                <p className="text-navy font-medium">
                  {format(new Date(stay.checkIn), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <span className="text-slate text-xs">Expected Departure</span>
                <p className="text-navy font-medium">
                  {format(new Date(stay.expectedDeparture), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <span className="text-slate text-xs">Nights Remaining</span>
                <p className="text-navy font-medium">
                  {nightsRemaining > 0 ? nightsRemaining : "Departing today"}
                </p>
              </div>
              <div>
                <span className="text-slate text-xs">Nightly Rate</span>
                <p className="text-navy font-medium">
                  {formatCurrency(stay.nightlyRate)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Credentials */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-heading font-semibold text-navy uppercase tracking-wide">
              Credentials
            </h3>
            <div className="flex flex-col gap-2">
              {stay.gateCode && (
                <div className="flex items-center gap-3 bg-navy/5 rounded-lg p-3">
                  <img
                    src="/assets/icon-gate.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-70"
                  />
                  <div>
                    <span className="text-xs text-slate">Gate Code</span>
                    <p className="font-mono text-lg text-navy font-medium">
                      {stay.gateCode}
                    </p>
                  </div>
                </div>
              )}
              {stay.wifiPassword && (
                <div className="flex items-center gap-3 bg-navy/5 rounded-lg p-3">
                  <img
                    src="/assets/icon-wifi.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="opacity-70"
                  />
                  <div>
                    <span className="text-xs text-slate">Wi-Fi Password</span>
                    <p className="font-mono text-lg text-navy font-medium">
                      {stay.wifiPassword}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 bg-navy/5 rounded-lg p-3">
                <img
                  src="/assets/icon-token.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-70"
                />
                <div>
                  <span className="text-xs text-slate">Shower Tokens</span>
                  <p className="font-mono text-lg text-navy font-medium">
                    {stay.showerTokensUsed} / {stay.showerTokens} used
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenity Usage Log */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-heading font-semibold text-navy uppercase tracking-wide">
              Amenity Log
            </h3>
            {stay.amenityUsages.length === 0 ? (
              <p className="text-sm text-slate py-2">No amenity usage yet</p>
            ) : (
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
                {stay.amenityUsages.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md bg-white border border-fog/60"
                  >
                    <img
                      src={amenityIcons[usage.type] ?? "/assets/icon-token.svg"}
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-60 shrink-0"
                    />
                    <span className="flex-1 text-navy truncate">
                      {amenityLabels[usage.type] ?? usage.type}
                      {usage.type === "fuel" && usage.fuelType
                        ? ` (${usage.quantity} gal ${usage.fuelType})`
                        : usage.type === "shore_power"
                          ? ` (${usage.quantity} kWh)`
                          : ""}
                    </span>
                    <span className="text-navy font-medium shrink-0">
                      {usage.totalAmount > 0
                        ? formatCurrency(usage.totalAmount)
                        : "Free"}
                    </span>
                    <span className="text-xs text-slate shrink-0">
                      {format(new Date(usage.createdAt), "MMM d h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Amenity Logger Quick Actions */}
          <AmenityLogger
            stayId={stay.id}
            showerTokens={stay.showerTokens}
            showerTokensUsed={stay.showerTokensUsed}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
