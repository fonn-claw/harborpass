"use client";

import { useState, useTransition } from "react";
import { logAmenity } from "@/app/board/actions";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmenityLoggerProps {
  stayId: number;
  showerTokens: number;
  showerTokensUsed: number;
}

export function AmenityLogger({
  stayId,
  showerTokens,
  showerTokensUsed,
}: AmenityLoggerProps) {
  const [isPending, startTransition] = useTransition();
  const [fuelOpen, setFuelOpen] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const [gallons, setGallons] = useState("10");
  const [fuelType, setFuelType] = useState<"diesel" | "gas">("diesel");
  const [kWh, setKWh] = useState("10");

  function handleSingleTap(type: "shower" | "pump_out" | "laundry") {
    startTransition(async () => {
      const result = await logAmenity({ type, stayId });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleFuelSubmit() {
    const g = parseFloat(gallons);
    if (isNaN(g) || g <= 0) {
      toast.error("Enter a valid gallon amount");
      return;
    }
    startTransition(async () => {
      const result = await logAmenity({
        type: "fuel",
        stayId,
        gallons: g,
        fuelType,
      });
      if (result.success) {
        toast.success(result.message);
        setFuelOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handlePowerSubmit() {
    const k = parseFloat(kWh);
    if (isNaN(k) || k <= 0) {
      toast.error("Enter a valid kWh amount");
      return;
    }
    startTransition(async () => {
      const result = await logAmenity({
        type: "shore_power",
        stayId,
        kWh: k,
      });
      if (result.success) {
        toast.success(result.message);
        setPowerOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  const btnBase =
    "flex items-center justify-center w-10 h-10 rounded-lg bg-sand hover:bg-fog/60 transition-colors disabled:opacity-40";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-heading font-semibold text-navy uppercase tracking-wide">
        Log Amenity
      </span>
      <div className="flex items-center gap-2">
        {/* Shower */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            className={btnBase}
            disabled={isPending}
            onClick={() => handleSingleTap("shower")}
            title="Log Shower"
          >
            <img
              src="/assets/icon-shower.svg"
              alt="Shower"
              width={20}
              height={20}
            />
          </button>
          <span className="text-[10px] text-slate font-mono">
            {showerTokensUsed}/{showerTokens}
          </span>
        </div>

        {/* Fuel */}
        <Popover open={fuelOpen} onOpenChange={setFuelOpen}>
          <PopoverTrigger
            className={btnBase}
            disabled={isPending}
            title="Log Fuel"
          >
            <img
              src="/assets/icon-fuel.svg"
              alt="Fuel"
              width={20}
              height={20}
            />
          </PopoverTrigger>
          <PopoverContent className="w-56" side="top" sideOffset={8}>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-heading font-semibold text-navy">
                Log Fuel
              </span>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fuel-gallons" className="text-xs">
                  Gallons
                </Label>
                <Input
                  id="fuel-gallons"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={gallons}
                  onChange={(e) => setGallons(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Type</Label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${fuelType === "diesel" ? "bg-ocean text-white border-ocean" : "bg-white text-slate border-fog hover:bg-fog/40"}`}
                    onClick={() => setFuelType("diesel")}
                  >
                    Diesel
                  </button>
                  <button
                    className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${fuelType === "gas" ? "bg-ocean text-white border-ocean" : "bg-white text-slate border-fog hover:bg-fog/40"}`}
                    onClick={() => setFuelType("gas")}
                  >
                    Gas
                  </button>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-ocean hover:bg-ocean/90 text-white"
                onClick={handleFuelSubmit}
                disabled={isPending}
              >
                Log Fuel
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Shore Power */}
        <Popover open={powerOpen} onOpenChange={setPowerOpen}>
          <PopoverTrigger
            className={btnBase}
            disabled={isPending}
            title="Log Shore Power"
          >
            <img
              src="/assets/icon-power.svg"
              alt="Power"
              width={20}
              height={20}
            />
          </PopoverTrigger>
          <PopoverContent className="w-56" side="top" sideOffset={8}>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-heading font-semibold text-navy">
                Log Shore Power
              </span>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="power-kwh" className="text-xs">
                  kWh
                </Label>
                <Input
                  id="power-kwh"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={kWh}
                  onChange={(e) => setKWh(e.target.value)}
                  className="h-8"
                />
              </div>
              <Button
                size="sm"
                className="bg-ocean hover:bg-ocean/90 text-white"
                onClick={handlePowerSubmit}
                disabled={isPending}
              >
                Log Power
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Pump-out */}
        <button
          className={btnBase}
          disabled={isPending}
          onClick={() => handleSingleTap("pump_out")}
          title="Log Pump-out"
        >
          <img
            src="/assets/icon-pump-out.svg"
            alt="Pump-out"
            width={20}
            height={20}
          />
        </button>

        {/* Laundry */}
        <button
          className={btnBase}
          disabled={isPending}
          onClick={() => handleSingleTap("laundry")}
          title="Log Laundry"
        >
          <img
            src="/assets/icon-laundry.svg"
            alt="Laundry"
            width={20}
            height={20}
          />
        </button>
      </div>
    </div>
  );
}
