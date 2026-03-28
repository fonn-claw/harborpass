export default function BoardPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <img
        src="/assets/empty-board.svg"
        alt="Dispatch Board"
        width={240}
        height={160}
        className="mb-6 opacity-60"
      />
      <h1 className="font-heading text-navy text-2xl font-bold mb-2">
        Dispatch Board
      </h1>
      <p className="text-slate">Coming in Phase 2</p>
    </div>
  );
}
