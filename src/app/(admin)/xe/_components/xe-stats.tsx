import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import type { XeStatsData } from "../_utils/xe-list";

type StatCard = {
  icon: string;
  tone: "sky" | "green" | "orange" | "slate";
  value: number;
  label: string;
};

const CARD_CLASS = [
  "flex items-center gap-[13px] rounded-[var(--radius-md)]",
  "border border-[var(--border)] bg-[var(--surface)]",
  "px-[18px] py-4 shadow-[var(--shadow-xs)]",
  "max-[640px]:gap-2.5 max-[640px]:px-3.5 max-[640px]:py-[13px]",
].join(" ");

const ICON_SPAN_CLASS = [
  "grid h-[46px] w-[46px] flex-none place-items-center",
  "rounded-[var(--radius-sm)]",
].join(" ");

const STAT_VALUE_CLASS = [
  "block [font-family:var(--font-heading)] text-2xl font-extrabold",
  "leading-[1.15] tracking-[-0.02em] text-[var(--ink)]",
  "max-[640px]:text-xl",
].join(" ");

const STATS_GRID_CLASS = [
  "mb-[22px] grid grid-cols-4 gap-3.5",
  "max-[1080px]:grid-cols-2 max-[640px]:gap-2.5",
  "max-[400px]:grid-cols-1",
].join(" ");

const ICON_TONE_CLASS: Record<StatCard["tone"], string> = {
  sky: "bg-[var(--sky-50)] text-[var(--sky-700)] shadow-[inset_0_0_0_1px_var(--sky-100)]",
  green:
    "bg-[var(--green-50)] text-[var(--green-700)] shadow-[inset_0_0_0_1px_var(--green-100)]",
  orange:
    "bg-[var(--orange-50)] text-[var(--orange-700)] shadow-[inset_0_0_0_1px_var(--orange-100)]",
  slate:
    "bg-[var(--slate-200)] text-[var(--slate-700)] shadow-[inset_0_0_0_1px_var(--slate-300)]",
};

export function XeStats({ stats }: { stats: XeStatsData }) {
  const cards: StatCard[] = [
    { icon: "i-car", tone: "sky", value: stats.total, label: "Tổng số xe" },
    {
      icon: "i-check-circle",
      tone: "green",
      value: stats.hoatDong,
      label: "Đang hoạt động",
    },
    {
      icon: "i-alert",
      tone: "orange",
      value: stats.baoTri,
      label: "Đang bảo trì",
    },
    {
      icon: "i-lock",
      tone: "slate",
      value: stats.ngungSuDung,
      label: "Ngưng sử dụng",
    },
  ];

  return (
    <section aria-label="Thống kê đội xe" className={STATS_GRID_CLASS}>
      {cards.map((card, index) => (
        <Reveal key={card.label} delay={index * 60}>
          <article className={CARD_CLASS}>
            <span
              className={`${ICON_SPAN_CLASS} ${ICON_TONE_CLASS[card.tone]}`}
            >
              <Icon name={card.icon} className="icon h-[22px] w-[22px]" />
            </span>
            <div>
              <strong className={STAT_VALUE_CLASS}>{card.value}</strong>
              <span className="text-[12.5px] font-semibold text-[var(--slate-500)]">
                {card.label}
              </span>
            </div>
          </article>
        </Reveal>
      ))}
    </section>
  );
}
