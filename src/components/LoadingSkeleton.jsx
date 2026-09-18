export default function LoadingSkeleton({ cards = 3, compact = false }) {
  return (
    <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`} aria-label="Chargement en cours" aria-busy="true">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="portal-panel animate-pulse">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
          <div className="mt-6 h-10 w-full rounded-xl bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
