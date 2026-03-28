"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2 } from "lucide-react";

interface CredentialsData {
  gateCode: string;
  wifiPassword: string;
  showerTokens: number;
}

interface StepCredentialsProps {
  credentials: CredentialsData | null;
  formData: {
    guestName: string;
    vesselName: string;
  };
  slipName: string;
  onComplete: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-navy/10 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="size-3.5 text-teal" />
      ) : (
        <Copy className="size-3.5 text-slate" />
      )}
    </button>
  );
}

export function StepCredentials({
  credentials,
  formData,
  slipName,
  onComplete,
  onSubmit,
  isSubmitting,
}: StepCredentialsProps) {
  // Loading state
  if (!credentials && isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="size-8 text-ocean animate-spin" />
        <span className="text-sm text-slate">Checking in...</span>
      </div>
    );
  }

  // Pre-submit state
  if (!credentials && !isSubmitting) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="rounded-lg border border-fog p-4">
          <h3 className="font-heading font-semibold text-navy text-sm mb-2">
            Confirm Check-In
          </h3>
          <div className="text-sm text-slate space-y-1">
            <p>
              <span className="text-navy font-medium">{formData.guestName}</span> on{" "}
              <span className="text-navy font-medium">{formData.vesselName}</span>
            </p>
            <p>
              Assigned to slip{" "}
              <span className="font-mono font-semibold text-navy">{slipName}</span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onSubmit}
          className="bg-teal hover:bg-teal/90 text-white w-full"
        >
          Complete Check-In
        </Button>
      </div>
    );
  }

  // Credentials display
  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Summary */}
      <div className="text-sm text-slate">
        <span className="text-navy font-medium">{formData.guestName}</span> on{" "}
        <span className="text-navy font-medium">{formData.vesselName}</span>{" "}
        &mdash; Slip{" "}
        <span className="font-mono font-semibold text-navy">{slipName}</span>
      </div>

      {/* Credential block */}
      <div className="bg-navy/5 rounded-lg p-4 space-y-4">
        {/* Gate Code */}
        <div>
          <span className="text-xs text-slate uppercase tracking-wide">Gate Code</span>
          <div className="flex items-center mt-1">
            <span className="font-mono text-2xl font-bold tracking-wider text-navy">
              {credentials!.gateCode}
            </span>
            <CopyButton text={credentials!.gateCode} />
          </div>
        </div>

        {/* Wi-Fi */}
        <div>
          <span className="text-xs text-slate uppercase tracking-wide">Wi-Fi Password</span>
          <div className="flex items-center mt-1">
            <span className="font-mono text-lg text-navy">
              {credentials!.wifiPassword}
            </span>
            <CopyButton text={credentials!.wifiPassword} />
          </div>
        </div>

        {/* Shower Tokens */}
        <div>
          <span className="text-xs text-slate uppercase tracking-wide">
            Shower Tokens
          </span>
          <div className="flex items-center gap-2 mt-1">
            <img
              src="/assets/icon-token.svg"
              alt=""
              width={18}
              height={18}
              className="opacity-70"
            />
            <span className="font-mono text-lg text-navy">
              {credentials!.showerTokens} included
            </span>
          </div>
        </div>
      </div>

      {/* Done button */}
      <Button
        type="button"
        onClick={onComplete}
        className="bg-teal hover:bg-teal/90 text-white w-full"
      >
        Done
      </Button>
    </div>
  );
}
