"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/hero-marina.png)" }}
    >
      <div className="min-h-screen bg-navy/40 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <img
            src="/assets/logo.svg"
            alt="HarborPass"
            className="mx-auto mb-6"
            width={180}
            height={43}
          />
          <h1 className="font-heading text-navy text-2xl font-bold text-center mb-6">
            Welcome to HarborPass
          </h1>

          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="text-coral text-sm text-center font-medium bg-coral/10 rounded-lg py-2 px-3">
                {state.error}
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                className="w-full px-4 py-3 rounded-lg border border-fog bg-white text-navy placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-ocean focus:border-ocean"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-lg border border-fog bg-white text-navy placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-ocean focus:border-ocean"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-ocean hover:bg-ocean/90 text-white font-heading font-semibold w-full py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-white/80 text-sm mt-4 text-center space-y-1">
          <p className="font-semibold text-white/90">Demo Accounts:</p>
          <p>staff@harborpass.app / demo1234</p>
          <p>manager@harborpass.app / demo1234</p>
          <p>guest@harborpass.app / demo1234</p>
        </div>
      </div>
    </div>
  );
}
