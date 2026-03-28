"use client";

import { useState } from "react";
import { UserMenu } from "./user-menu";

interface GuestHeaderProps {
  userName: string;
}

export function GuestHeader({ userName }: GuestHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-fog h-14 flex items-center justify-between px-6 relative">
      <div className="flex items-center gap-3">
        <img
          src="/assets/logo.svg"
          alt="HarborPass"
          width={120}
          height={30}
        />
        <span className="font-heading text-navy text-base font-semibold hidden sm:inline">
          Guest Portal
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center">
        <UserMenu userName={userName} variant="light" />
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-navy transition-transform duration-200 ${menuOpen ? "translate-y-[4px] rotate-45" : ""}`} />
        <span className={`block w-5 h-0.5 bg-navy transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-navy transition-transform duration-200 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-14 right-0 left-0 bg-white border-b border-fog px-6 py-4 flex flex-col gap-3 md:hidden z-50 shadow-lg">
          <span className="font-heading text-navy text-base font-semibold">
            Guest Portal
          </span>
          <UserMenu userName={userName} variant="light" />
        </div>
      )}
    </header>
  );
}
