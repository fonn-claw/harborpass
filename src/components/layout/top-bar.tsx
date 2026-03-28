export function TopBar() {
  return (
    <header className="bg-navy text-white h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <img
          src="/assets/logo.svg"
          alt="HarborPass"
          width={140}
          height={36}
        />
        <span className="font-heading text-lg font-semibold">
          Sunset Harbor Marina
        </span>
      </div>
      <div className="flex items-center gap-4">
        {/* Action area: search + check-in button added in Phase 2 */}
        {/* User menu: wired in Plan 02 with logout */}
      </div>
    </header>
  );
}
