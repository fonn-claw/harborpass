"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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

function sortSlipsNumerically(slips: SlipWithStay[]): SlipWithStay[] {
  return [...slips].sort((a, b) => {
    const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });
}

const legendItems = [
  { label: "Available", className: "bg-teal/10 border border-teal" },
  { label: "Occupied", className: "bg-ocean border border-ocean" },
  { label: "Departing", className: "bg-rope border border-rope" },
  { label: "Maintenance", className: "bg-fog border border-fog" },
];

export function DockStrip({ slips, onSlipClick }: DockStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkOverflow, { passive: true });
    window.addEventListener("resize", checkOverflow);
    return () => {
      el.removeEventListener("scroll", checkOverflow);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [checkOverflow]);

  const sorted = sortSlipsNumerically(slips);

  return (
    <TooltipProvider delay={200}>
      <div className="bg-white border-b border-fog px-4 py-3 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate uppercase tracking-wide">
            Transient Slips
          </span>
          <div className="flex items-center gap-3">
            {legendItems.map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-sm ${item.className}`}
                />
                <span className="text-[10px] text-slate/70">{item.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Left overflow fade */}
        {showLeftFade && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
        >
          {sorted.map((slip) => (
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

        {/* Right overflow fade */}
        {showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </TooltipProvider>
  );
}
