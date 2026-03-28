import { Skeleton } from "@/components/ui/skeleton";

export default function BoardLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-sand">
      {/* Dock strip skeleton */}
      <div className="bg-white border-b border-fog px-4 py-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="w-10 h-7 rounded shrink-0" />
          ))}
        </div>
      </div>

      {/* Three-column skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-fog overflow-hidden pt-2">
        {["Arriving Today", "Checked In", "Departing Today"].map((title) => (
          <div key={title} className="flex flex-col min-w-0">
            {/* Column header skeleton */}
            <div className="px-3 py-2.5">
              <Skeleton className="h-6 w-40" />
            </div>

            {/* Card skeletons */}
            <div className="flex flex-col gap-2 px-2 pb-4">
              {Array.from({ length: title === "Checked In" ? 4 : 3 }).map(
                (_, i) => (
                  <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
