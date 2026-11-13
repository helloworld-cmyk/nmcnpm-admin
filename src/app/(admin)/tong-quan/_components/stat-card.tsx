import { Icon } from "@/components/icons/icon";
import type { IconTone, StatKpi, TrendTone } from "../_data/tong-quan";

const CARD_CLASS =
  "rounded-[var(--radius-md)] border bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)] transition-[transform,border-color,box-shadow] duration-[0.24s] ease-[var(--ease)] hover:-translate-y-[3px] hover:border-[var(--sky-300)] hover:shadow-[var(--shadow-sm)]";

const ICON_TONE_CLASS: Record<IconTone, string> = {
  sky: "bg-[var(--sky-50)] text-[var(--sky-700)] shadow-[inset_0_0_0_1px_rgba(3,105,161,0.14)]",
  navy: "bg-[var(--navy-50)] text-[var(--navy-800)] shadow-[inset_0_0_0_1px_rgba(11,27,51,0.12)]",
  orange:
    "bg-[var(--orange-50)] text-[var(--orange-600)] shadow-[inset_0_0_0_1px_rgba(234,88,12,0.16)]",
  green:
    "bg-[var(--green-50)] text-[var(--green-600)] shadow-[inset_0_0_0_1px_rgba(5,150,105,0.16)]",
};

const TREND_TONE_CLASS: Record<TrendTone, string> = {
  good: "bg-[var(--green-50)] text-[var(--green-700)]",
  bad: "bg-[var(--red-50)] text-[var(--red-600)]",
  muted: "bg-[var(--navy-50)] text-[var(--slate-600)]",
};

const LABEL_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";

const VALUE_CLASS =
  "[font-family:var(--font-heading)] text-[clamp(1.45rem,1.9vw,1.75rem)] font-extrabold leading-[1.2] tracking-[-0.02em] tabular-nums";

const UNIT_CLASS =
  "[font-family:var(--font-body)] text-[13px] font-semibold text-[var(--slate-500)]";

const DELTA_CLASS =
  "mt-[9px] flex flex-wrap items-center gap-1.5 text-xs font-medium text-[var(--slate-500)]";

const TREND_CLASS =
  "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] font-bold leading-[1.2]";

export function StatCard({ kpi }: { kpi: StatKpi }) {
  return (
    <article
      className={`${CARD_CLASS} ${kpi.warn ? "border-[var(--orange-500)]" : "border-[var(--border)]"}`}
    >
      <div className="mb-3.5 flex items-start justify-between gap-2.5">
        <span className={LABEL_CLASS}>{kpi.label}</span>
        <span
          className={`grid h-10 w-10 flex-none place-items-center rounded-[11px] ${ICON_TONE_CLASS[kpi.iconTone]}`}
          aria-hidden="true"
        >
          <Icon name={kpi.icon} className="h-[19px] w-[19px] flex-none" />
        </span>
      </div>
      <p
        className={`${VALUE_CLASS} ${kpi.warn ? "text-[var(--orange-700)]" : "text-[var(--ink)]"}`}
      >
        {kpi.value}
        {kpi.unit ? <span className={UNIT_CLASS}> {kpi.unit}</span> : null}
      </p>
      <p className={DELTA_CLASS}>
        <span className={`${TREND_CLASS} ${TREND_TONE_CLASS[kpi.trend]}`}>
          <Icon name={kpi.trendIcon} className="h-[13px] w-[13px] flex-none" />
          {kpi.trendText}
        </span>
        {kpi.delta}
      </p>
    </article>
  );
}
