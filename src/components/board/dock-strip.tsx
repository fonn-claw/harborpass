"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SlipWithStay } from "@/lib/queries";

interface DockStripProps {
  slips: SlipWithStay[];
  onSlipClick?: (slip: SlipWithStay) => void;
}

function slipStyle(slip: SlipWithStay) {
  const activeStay = slip.stays[0];
  const status = slip.status;

  if (status === "maintenance") {
    return "bg-fog text-slate border border-fog";
  }
  if (status === "departing_today") {
    return "bg-rope text-white border border-rope";
  }
  if (status === "occupied" || activeStay) {
    return "bg-ocean text-white border border-ocean";
  }
  // available
  return "bg-teal/10 text-teal border border-teal";
}

function slipTooltip(slip: SlipWithStay): string {
  const activeStay = slip.stays[0];
  const status = slip.status;

  if (status === "maintenance") {
    return `${slip.name} -- Maintenance`;
  }

  if (activeStay) {
    const guest = activeStay.guest;
    const depDate = new Date(activeStay.expectedDeparture);
    const depStr = depDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${slip.name}: ${guest.vesselName} (${guest.vesselLoa}' ${guest.name}) -- Departs ${depStr}`;
  }

  return `${slip.name} -- Available (${slip.maxLoa}' max)`;
}

export function DockStrip({ slips, onSlipClick }: DockStripProps) {
  return (
    <TooltipProvider delay={200}>
      <div className="bg-white border-b border-fog px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {slips.map((slip) => (
            <Tooltip key={slip.id}>
              <TooltipTrigger
                className={`shrink-0 w-10 h-7 rounded flex items-center justify-center font-mono text-[10px] font-medium transition-colors hover:opacity-80 cursor-pointer ${slipStyle(slip)}`}
                onClick={() => onSlipClick?.(slip)}
              >
                {slip.name}
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {slipTooltip(slip)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
