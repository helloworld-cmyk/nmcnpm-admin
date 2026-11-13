"use client";

import { overlaps, pct, type BusyInterval } from "../_utils/chuyen-form";

type AvailRowProps = {
  name: string;
  busy: BusyInterval[];
  plan: BusyInterval | null;
  label: string;
};

export function AvailRow({ name, busy, plan, label }: AvailRowProps) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2.5">
      <span
        className="truncate text-[12px] font-bold text-[var(--ink)]"
        title={name}
      >
        {name}
      </span>
      <span
        className="relative h-[18px] overflow-hidden rounded-md bg-[var(--green-50)]"
        role="img"
        aria-label={label}
      >
        {plan && (
          <span
            className="absolute inset-y-0 z-[1] bg-[var(--sky-500)] opacity-30"
            style={{
              left: `${pct(plan[0]).toFixed(2)}%`,
              width: `${(pct(plan[1]) - pct(plan[0])).toFixed(2)}%`,
            }}
          />
        )}
        {busy.map((interval, index) => {
          const clash = plan !== null && overlaps(interval, plan[0], plan[1]);
          return (
            <span
              key={`${interval[0]}-${interval[1]}-${index}`}
              className={`absolute inset-y-0${
                clash
                  ? " border border-[var(--red-600)] bg-[var(--red-50)]"
                  : " bg-[var(--orange-100)]"
              }`}
              style={{
                left: `${pct(interval[0]).toFixed(2)}%`,
                width: `${(pct(interval[1]) - pct(interval[0])).toFixed(2)}%`,
              }}
            />
          );
        })}
      </span>
    </div>
  );
}
