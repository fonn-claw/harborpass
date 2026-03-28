"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";

interface ChargeEntry {
  description: string;
  category: string;
  amount: number;
  createdAt: string;
}

interface GuestHistoryEntry {
  stayId: number;
  guestId: number;
  guestName: string;
  vesselName: string;
  vesselLoa: number;
  slipName: string | null;
  checkIn: string;
  checkOut: string | null;
  status: string;
  totalCharges: number;
  stayCount: number;
  charges: ChargeEntry[];
}

const CATEGORY_ORDER: Record<string, number> = { slip: 0, amenity: 1, fuel: 2 };

function sortCharges(charges: ChargeEntry[]): ChargeEntry[] {
  return [...charges].sort(
    (a, b) => (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)
  );
}

function categoryBadgeColor(cat: string): string {
  switch (cat) {
    case "slip":
      return "bg-ocean/10 text-ocean";
    case "fuel":
      return "bg-rope/10 text-rope";
    case "amenity":
      return "bg-teal/10 text-teal";
    default:
      return "bg-fog text-slate";
  }
}

export function GuestHistory({ history }: { history: GuestHistoryEntry[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = search.trim()
    ? history.filter((h) => {
        const term = search.toLowerCase();
        return (
          h.guestName.toLowerCase().includes(term) ||
          h.vesselName.toLowerCase().includes(term)
        );
      })
    : history;

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/icon-guest.svg" alt="" width={20} height={20} className="opacity-70" />
          <h2 className="font-heading text-lg font-semibold text-navy">Guest History</h2>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search guests or vessels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <img
              src="/assets/empty-search.svg"
              alt="No results"
              width={160}
              height={106}
              className="mb-4 opacity-60"
            />
            <p className="text-slate text-sm">No guests match your search</p>
          </div>
        ) : (
          <div className="divide-y divide-fog">
            {filtered.map((entry) => {
              const isExpanded = expandedId === entry.stayId;
              const isCurrent = entry.status === "checked_in" || entry.status === "reserved";

              return (
                <div key={entry.stayId}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-3 hover:bg-sand/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : entry.stayId)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-navy">{entry.guestName}</span>
                      {entry.stayCount > 1 && (
                        <Badge className="bg-ocean text-white text-[10px] px-1.5 py-0">
                          Repeat Visitor
                        </Badge>
                      )}
                      <span className="text-slate text-sm">
                        {entry.vesselName} ({entry.vesselLoa}&apos;)
                      </span>
                      <span className="text-slate text-sm ml-auto flex items-center gap-3">
                        {entry.slipName && (
                          <span className="font-mono text-xs">{entry.slipName}</span>
                        )}
                        <span>{formatDate(entry.checkIn)}</span>
                        <span>&ndash;</span>
                        {isCurrent ? (
                          <Badge className="bg-teal text-white text-[10px] px-1.5 py-0">
                            Current
                          </Badge>
                        ) : (
                          <span>{entry.checkOut ? formatDate(entry.checkOut) : "N/A"}</span>
                        )}
                        <span className="font-medium text-navy min-w-[70px] text-right">
                          {formatCurrency(entry.totalCharges)}
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </button>

                  {isExpanded && entry.charges.length > 0 && (
                    <div className="px-3 pb-4">
                      <div className="border-t border-fog pt-3 ml-3">
                        <div className="space-y-1.5">
                          {sortCharges(entry.charges).map((ch, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 text-sm py-1"
                            >
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryBadgeColor(ch.category)}`}
                              >
                                {ch.category}
                              </span>
                              <span className="text-navy">{ch.description}</span>
                              <span className="text-slate text-xs ml-auto">
                                {formatDate(ch.createdAt)}
                              </span>
                              <span className="font-medium text-navy min-w-[60px] text-right">
                                {formatCurrency(ch.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
