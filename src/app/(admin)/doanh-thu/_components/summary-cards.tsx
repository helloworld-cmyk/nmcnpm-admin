"use client";

import { Icon } from "@/components/icons/icon";
import { formatVND } from "../_data/doanh-thu";
import type { ChangeTone } from "../_utils/map-report";
import { useDoanhThuReport } from "../_hooks/use-doanh-thu-report";

const CARD =
  "flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[var(--shadow-sm)] max-[520px]:p-4";
const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";
const VALUE =
  "[font-family:var(--font-heading)] text-[26px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] [font-variant-numeric:tabular-nums] max-[520px]:text-[23px]";
const SUB = "text-[12.5px] font-medium leading-[1.45] text-[var(--slate-500)]";
const CHANGE_BASE = "inline-flex items-center gap-1 text-[12px] font-bold";
const CHANGE_TONE: Record<ChangeTone, string> = {
  up: "text-[var(--green-700)]",
  down: "text-[var(--red-600)]",
};
const ICON_WRAP =
  "grid h-[42px] w-[42px] flex-none place-items-center rounded-[var(--radius-sm)] shadow-[inset_0_0_0_1px_rgba(8,20,38,0.06)]";

const TONES: Record<string, string> = {
  sky: "bg-[var(--sky-100)] text-[var(--sky-700)]",
  green: "bg-[var(--green-100)] text-[var(--green-700)]",
  navy: "bg-[var(--navy-50)] text-[var(--navy-700)]",
  orange: "bg-[var(--orange-100)] text-[var(--orange-700)]",
};

const EMPTY_SUB = "Chưa có dữ liệu trong kỳ đã chọn";

export function SummaryCards() {
  const { companyId, report, isLoading, isError, error, refetch } =
    useDoanhThuReport();

  const avgTicket =
    report && report.tickets > 0
      ? Math.round(report.ticketValue / report.tickets)
      : 0;

  const cards = [
    {
      label: "Doanh thu thực thu",
      icon: "i-wallet",
      tone: "sky",
      value: formatVND(report?.ticketValue ?? 0),
      sub: report?.note || EMPTY_SUB,
      change: report?.revenueChange ?? null,
    },
    {
      label: "Vé đã thu",
      icon: "i-ticket",
      tone: "navy",
      value: String(report?.tickets ?? 0),
      sub: report
        ? report.actualCollected
          ? "Đã ghi nhận thực thu"
          : "Giá trị vé (chưa thực thu)"
        : EMPTY_SUB,
      change: report?.ticketsChange ?? null,
    },
    {
      label: "Giá vé trung bình",
      icon: "i-percent",
      tone: "green",
      value: avgTicket > 0 ? formatVND(avgTicket) : "—",
      sub: report ? `Trên ${report.tickets} vé đã thu` : EMPTY_SUB,
      change: null,
    },
    {
      label: "Kỳ báo cáo",
      icon: "i-calendar",
      tone: "orange",
      value: report ? report.rangeLabel : "—",
      sub: report
        ? report.previousRangeLabel
          ? `${report.days.length} ngày · kỳ trước ${report.previousRangeLabel}`
          : `${report.days.length} ngày có phát sinh`
        : EMPTY_SUB,
      change: null,
    },
  ];

  if (companyId.length === 0) {
    return (
      <div className="state-empty">
        <span className="state-empty-icon">
          <Icon name="i-alert" className="icon" />
        </span>
        <h3>Chưa chọn hãng quản lý</h3>
        <p>Chọn hãng đang quản lý để xem doanh thu.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="state-loading">Đang tải báo cáo doanh thu...</div>;
  }

  if (isError) {
    return (
      <div className="state-empty">
        <span className="state-empty-icon text-[var(--red-600)]">
          <Icon name="i-alert" className="icon" />
        </span>
        <h3>Không tải được báo cáo doanh thu</h3>
        <p>
          {error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi tải dữ liệu."}
        </p>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => void refetch()}
        >
          <Icon name="i-refresh" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="kpi-title">
      <h2 className="sr-only" id="kpi-title">
        Chỉ số kỳ
      </h2>

      <div className="grid grid-cols-4 gap-4 max-[1024px]:grid-cols-2 max-[520px]:grid-cols-1">
        {cards.map((card) => (
          <article key={card.label} className={CARD}>
            <div className="flex items-center justify-between gap-3">
              <span className={LABEL}>{card.label}</span>
              <span className={`${ICON_WRAP} ${TONES[card.tone]}`}>
                <Icon name={card.icon} className="icon" />
              </span>
            </div>
            <p className={VALUE}>{card.value}</p>
            {card.change ? (
              <p className={`${CHANGE_BASE} ${CHANGE_TONE[card.change.tone]}`}>
                <Icon
                  name={
                    card.change.tone === "up" ? "i-trending-up" : "i-trending-down"
                  }
                  className="h-[13px] w-[13px] flex-none"
                />
                {card.change.text}
              </p>
            ) : null}
            <p className={SUB}>{card.sub}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
