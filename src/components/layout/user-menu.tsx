"use client";

import { logout } from "@/lib/auth";

interface UserMenuProps {
  userName: string;
  variant?: "dark" | "light";
}

export function UserMenu({ userName, variant = "dark" }: UserMenuProps) {
  const nameClass =
    variant === "dark" ? "text-white/90" : "text-navy";
  const buttonClass =
    variant === "dark"
      ? "text-white/70 hover:text-white"
      : "text-slate hover:text-navy";

  return (
    <div className="flex items-center gap-3">
      <span className={`${nameClass} text-sm font-body`}>{userName}</span>
      <form action={logout}>
        <button
          type="submit"
          className={`${buttonClass} text-sm font-body transition-colors`}
        >
          Log out
        </button>
      </form>
    </div>
  );
}
