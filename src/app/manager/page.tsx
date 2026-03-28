import { getOccupancyStats, getRevenueBreakdown, getGuestHistory } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { GuestHistory } from "./guest-history";

const CATEGORY_LABELS: Record<string, string> = {
  slip: "Slip Fees",
  fuel: "Fuel",
  amenity: "Amenities",
};

const CATEGORY_COLORS: Record<string, string> = {
  slip: "bg-ocean",
  fuel: "bg-rope",
  amenity: "bg-teal",
};

export default async function ManagerPage() {
  const [occupancy, revenue, history] = await Promise.all([
    getOccupancyStats(),
    getRevenueBreakdown(),
    getGuestHistory(),
  ]);

  const monthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const maxCategoryTotal = Math.max(...revenue.categories.map((c) => c.total), 1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Occupancy Overview */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/icon-chart.svg" alt="" width={20} height={20} className="opacity-70" />
            <h2 className="font-heading text-lg font-semibold text-navy">Occupancy Overview</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-ocean inline-block" />
                <span className="font-heading text-2xl font-bold text-navy">{occupancy.occupied}</span>
              </div>
              <p className="text-slate text-sm">
                Occupied ({Math.round((occupancy.occupied / occupancy.total) * 100)}%)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-teal inline-block" />
                <span className="font-heading text-2xl font-bold text-navy">{occupancy.available}</span>
              </div>
              <p className="text-slate text-sm">
                Available ({Math.round((occupancy.available / occupancy.total) * 100)}%)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-rope inline-block" />
                <span className="font-heading text-2xl font-bold text-navy">{occupancy.departingToday}</span>
              </div>
              <p className="text-slate text-sm">
                Departing Today ({Math.round((occupancy.departingToday / occupancy.total) * 100)}%)
              </p>
            </div>
          </div>

          {/* Occupancy bar */}
          <div className="flex w-full h-3 rounded-full overflow-hidden">
            {occupancy.occupied > 0 && (
              <div
                className="bg-ocean"
                style={{ width: `${(occupancy.occupied / occupancy.total) * 100}%` }}
              />
            )}
            {occupancy.departingToday > 0 && (
              <div
                className="bg-rope"
                style={{ width: `${(occupancy.departingToday / occupancy.total) * 100}%` }}
              />
            )}
            {occupancy.available > 0 && (
              <div
                className="bg-teal"
                style={{ width: `${(occupancy.available / occupancy.total) * 100}%` }}
              />
            )}
            {occupancy.maintenance > 0 && (
              <div
                className="bg-fog"
                style={{ width: `${(occupancy.maintenance / occupancy.total) * 100}%` }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <img src="/assets/icon-receipt.svg" alt="" width={20} height={20} className="opacity-70" />
            <h2 className="font-heading text-lg font-semibold text-navy">Revenue &mdash; {monthName}</h2>
          </div>

          <p className="font-heading text-2xl font-bold text-navy mb-6">
            {formatCurrency(revenue.grandTotal)}
          </p>

          <div className="space-y-4">
            {revenue.categories.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy">
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </span>
                  <span className="text-sm text-slate">{formatCurrency(cat.total)}</span>
                </div>
                <div className="w-full bg-fog/50 rounded-full h-2">
                  <div
                    className={`${CATEGORY_COLORS[cat.category] || "bg-ocean"} h-2 rounded-full`}
                    style={{ width: `${(cat.total / maxCategoryTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guest History */}
      <GuestHistory history={JSON.parse(JSON.stringify(history))} />
    </div>
  );
}
