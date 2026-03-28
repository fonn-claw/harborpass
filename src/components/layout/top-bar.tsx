"use client";

import { useState } from "react";
import { UserMenu } from "./user-menu";

interface TopBarProps {
  userName: string;
  actions?: React.ReactNode;
}

export function TopBar({ userName, actions }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-navy text-white h-16 flex items-center justify-between px-6 relative">
      <div className="flex items-center gap-4">
        <img
          src="/assets/logo.svg"
          alt="HarborPass"
          width={140}
          height={36}
          className="brightness-0 invert"
        />
        <span className="font-heading text-lg font-semibold hidden sm:inline">
          Sunset Harbor Marina
        </span>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-4">
        {actions}
        <UserMenu userName={userName} />
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? "translate-y-[4px] rotate-45" : ""}`} />
        <span className={`block w-5 h-0.5 bg-white transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-navy border-t border-white/10 px-6 py-4 flex flex-col gap-3 md:hidden z-50 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
          <UserMenu userName={userName} />
        </div>
      )}
    </header>
  );
}
