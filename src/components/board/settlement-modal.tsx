"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { settleAccount } from "@/app/board/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { BoardData } from "@/lib/queries";

type StayData = BoardData["arriving"][number];

interface SettlementModalProps {
  stayId: number | null;
  stays: StayData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Group charges by category for display
const CATEGORY_LABELS: Record<string, string> = {
  slip: "Nightly Slip Rate",
  fuel: "Fuel",
  amenity: "Amenities",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export function SettlementModal({
  stayId,
  stays,
  open,
  onOpenChange,
}: SettlementModalProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const stay = useMemo(
    () => (stayId ? stays.find((s) => s.id === stayId) : null),
    [stayId, stays]
  );

  // Compute charges from the stay's charges relation
  const charges = stay?.charges ?? [];

  // Group charges by category
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof charges>();
    for (const charge of charges) {
      const key = charge.category;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(charge);
    }
    return groups;
  }, [charges]);

  const totalAmount = useMemo(
    () => charges.reduce((sum, ch) => sum + ch.amount, 0),
    [charges]
  );

  // Calculate night count
  const nightCount = stay
    ? Math.max(
        1,
        Math.ceil(
          (new Date().getTime() - new Date(stay.checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const handleComplete = () => {
    if (!stayId) return;
    startTransition(async () => {
      const result = await settleAccount(stayId);
      if (result.success) {
        toast.success(`Checked out ${stay?.guest.name ?? "guest"}`);
        setConfirming(false);
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Settlement failed");
      }
    });
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirming(false);
    }
    onOpenChange(newOpen);
  };

  if (!stay) return null;

  // Order categories: slip first, then fuel, then amenity, then others
  const categoryOrder = ["slip", "fuel", "amenity"];
  const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">
            Settlement &mdash; {stay.guest.name}
          </DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{stay.guest.vesselName}</span>
            {stay.slip && (
              <>
                {" "}
                &middot; Slip{" "}
                <span className="font-mono">{stay.slip.name}</span>
              </>
            )}
            {" "}&middot;{" "}
            {formatDate(stay.checkIn)} &ndash; Today ({nightCount}{" "}
            {nightCount === 1 ? "night" : "nights"})
          </DialogDescription>
        </DialogHeader>

        {/* Charges table */}
        <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
          <table className="w-full text-sm">
            {sortedCategories.map((category) => {
              const items = grouped.get(category)!;
              const subtotal = items.reduce((s, c) => s + c.amount, 0);

              return (
                <tbody key={category}>
                  {/* Category header */}
                  <tr>
                    <td
                      colSpan={2}
                      className="pt-3 pb-1 font-heading font-semibold text-navy text-xs uppercase tracking-wide"
                    >
                      {getCategoryLabel(category)}
                    </td>
                  </tr>

                  {/* Individual charges */}
                  {items.map((charge) => (
                    <tr key={charge.id} className="border-b border-fog/50">
                      <td className="py-1.5 pr-4 text-slate">
                        {charge.description}
                      </td>
                      <td className="py-1.5 text-right font-mono text-slate w-24">
                        {formatCurrency(charge.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* Category subtotal */}
                  {sortedCategories.length > 1 && (
                    <tr>
                      <td className="py-1 pr-4 text-right text-xs text-slate/70">
                        Subtotal
                      </td>
                      <td className="py-1 text-right font-mono text-xs text-slate/70 w-24">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </table>
        </div>

        {/* Grand total */}
        <div className="border-t-2 border-navy/20 pt-3 flex items-center justify-between">
          <span className="font-heading text-lg text-navy font-bold">
            Total
          </span>
          <span className="font-heading text-xl text-navy font-bold font-mono">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <p className="text-xs text-slate">Payment logged externally</p>

        {/* Action buttons */}
        {!confirming ? (
          <Button
            className="w-full bg-teal hover:bg-teal/90 text-white"
            onClick={() => setConfirming(true)}
          >
            Complete Checkout
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center text-navy font-medium">
              Settle account for {stay.guest.name}? Total:{" "}
              {formatCurrency(totalAmount)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirming(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal/90 text-white"
                onClick={handleComplete}
                disabled={isPending}
              >
                {isPending ? "Settling..." : "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
