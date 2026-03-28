export default function GuestPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <img
        src="/assets/icon-guest.svg"
        alt="Guest"
        width={80}
        height={80}
        className="mb-6 opacity-60"
      />
      <h1 className="font-heading text-navy text-2xl font-bold mb-2">
        Welcome to Sunset Harbor Marina
      </h1>
      <p className="text-slate">Your guest portal is coming in Phase 3</p>
    </div>
  );
}
