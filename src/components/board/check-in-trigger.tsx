"use client";

import { Button } from "@/components/ui/button";

export function CheckInTrigger() {
  return (
    <Button
      className="bg-teal hover:bg-teal/90 text-white gap-2"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("open-checkin-wizard"));
      }}
    >
      <img
        src="/assets/icon-check-in.svg"
        alt=""
        width={16}
        height={16}
        className="brightness-0 invert"
      />
      Check In
    </Button>
  );
}
