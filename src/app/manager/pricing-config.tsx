"use client";

import { useState } from "react";
import type { PricingEntry } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { updatePricingRate } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORY_HEADINGS: Record<string, string> = {
  amenity: "Amenity Fees",
  fuel: "Fuel Prices",
  slip: "Nightly Slip Rates",
};

const CATEGORY_ORDER = ["slip", "amenity", "fuel"];

interface PricingConfigProps {
  pricing: PricingEntry[];
}

export function PricingConfig({ pricing }: PricingConfigProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Group by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    heading: CATEGORY_HEADINGS[cat] || cat,
    entries: pricing.filter((p) => p.category === cat),
  })).filter((g) => g.entries.length > 0);

  function startEdit(entry: PricingEntry) {
    setEditingId(entry.id);
    setEditValue((entry.rate / 100).toFixed(2));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function handleSave(id: number) {
    const parsed = parseFloat(editValue);
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Invalid price");
      return;
    }

    const cents = Math.round(parsed * 100);
    setSaving(true);

    const result = await updatePricingRate(id, cents);

    setSaving(false);

    if (result.success) {
      toast("Price updated");
      setEditingId(null);
      setEditValue("");
    } else {
      toast.error(result.error || "Failed to update price");
    }
  }

  const isValidValue = () => {
    const parsed = parseFloat(editValue);
    return !isNaN(parsed) && parsed >= 0 && editValue.trim() !== "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <img
          src="/assets/icon-settings.svg"
          alt=""
          width={20}
          height={20}
          className="opacity-70"
        />
        <h2 className="font-heading text-lg font-semibold text-navy">
          Pricing Configuration
        </h2>
      </div>

      {grouped.map((group, gi) => (
        <div key={group.category}>
          {gi > 0 && <div className="border-t border-fog my-4" />}
          <p className={`text-sm font-semibold text-slate uppercase tracking-wide mb-2 ${gi === 0 ? "" : "mt-4"}`}>
            {group.heading}
          </p>

          {group.entries.map((entry, ei) => (
            <div
              key={entry.id}
              className={`flex justify-between items-center py-3 ${
                ei < group.entries.length - 1 ? "border-b border-fog" : ""
              }`}
            >
              <div>
                <span className="text-navy font-medium">{entry.name}</span>
                <span className="text-slate text-sm ml-2">per {entry.unit}</span>
              </div>

              {editingId === entry.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate text-sm">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 text-right"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValidValue()) handleSave(entry.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="bg-ocean text-white hover:bg-ocean/90"
                    onClick={() => handleSave(entry.id)}
                    disabled={!isValidValue() || saving}
                  >
                    {saving ? "..." : "Save"}
                  </Button>
                  <button
                    type="button"
                    className="text-slate text-sm hover:text-navy"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="font-mono text-navy font-semibold hover:text-ocean cursor-pointer transition-colors"
                  onClick={() => startEdit(entry)}
                  title="Click to edit"
                >
                  {formatCurrency(entry.rate)}
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
