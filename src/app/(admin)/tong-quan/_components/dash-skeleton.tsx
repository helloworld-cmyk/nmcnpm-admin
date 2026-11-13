const SK_CLASS =
  "block h-[118px] animate-pulse rounded-[var(--radius-md)] bg-[var(--border-soft)]";

const ROW_CLASS =
  "mt-3.5 grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-3.5 max-[1024px]:grid-cols-1";

export function DashSkeleton() {
  return (
    <div className="py-[clamp(36px,6vw,72px)]" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3.5 min-[700px]:grid-cols-3 min-[1320px]:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={SK_CLASS} />
        ))}
      </div>
      {[0, 1].map((row) => (
        <div key={row} className={ROW_CLASS}>
          <span className={`${SK_CLASS} h-[264px] rounded-[var(--radius-lg)]`} />
          <span className={`${SK_CLASS} h-[264px] rounded-[var(--radius-lg)]`} />
        </div>
      ))}
    </div>
  );
}
