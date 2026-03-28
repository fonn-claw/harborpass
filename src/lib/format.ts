/**
 * Format cents as a dollar string, e.g. 8500 -> "$85.00"
 */
export function formatCurrency(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

/**
 * Format a date for display, e.g. "Mar 28, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
