"use client";

import { Icon } from "@/components/icons/icon";
import type { CompanyBookingStatisticsResponse } from "@/api/don-dat/api/types";
import { formatTien } from "../_data/don-dat";

const CARD =
  "flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[var(--shadow-sm)] max-[520px]:p-4";
const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";
const VALUE =
  "[font-family:var(--font-heading)] text-[26px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] [font-variant-numeric:tabular-nums] max-[520px]:text-[23px]";
const SUB = "text-[12.5px] font-medium leading-[1.45] text-[var(--slate-500)]";
const ICON_WRAP =
  "grid h-[42px] w-[42px] flex-none place-items-center rounded-[var(--radius-sm)] shadow-[inset_0_0_0_1px_rgba(8,20,38,0.06)]";

type DonDatStatsProps = {
  companyId: string;
  statistics: CompanyBookingStatisticsResponse | null;
  loading: boolean;
};

export function DonDatStats({
  companyId,
  statistics,
  loading,
}: DonDatStatsProps) {
  if (companyId.length === 0) {
    return null;
  }

  if (loading && !statistics) {
    return <div className="state-loading">Đang tải số liệu đơn đặt...</div>;
  }

  const cards = [
    {
      label: "Đơn đặt hôm nay",
      icon: "i-list",
      tone: "bg-[var(--sky-100)] text-[var(--sky-700)]",
      value: String(statistics?.todayBookings ?? 0),
      sub: statistics
        ? `Ngày ${statistics.date} · ${statistics.timezone}`
        : "Chưa có dữ liệu hôm nay",
    },
    {
      label: "Vé đã xác nhận",
      icon: "i-ticket",
      tone: "bg-[var(--navy-50)] text-[var(--navy-700)]",
      value: String(statistics?.bookedTickets ?? 0),
      sub: "Vé CONFIRMED trong đơn đã xác nhận",
    },
    {
      label: "Giá trị vé",
      icon: "i-wallet",
      tone: "bg-[var(--green-100)] text-[var(--green-700)]",
      value: statistics
        ? formatTien(statistics.totalTicketAmount, statistics.currency)
        : "—",
      sub: "Tổng giá trị vé đã xác nhận hôm nay",
    },
  ];

  return (
    <section aria-labelledby="dd-stats-title">
      <h2 className="sr-only" id="dd-stats-title">
        Số liệu đơn đặt
      </h2>
      <div className="grid grid-cols-3 gap-4 max-[1024px]:grid-cols-2 max-[520px]:grid-cols-1">
        {cards.map((card) => (
          <article key={card.label} className={CARD}>
            <div className="flex items-center justify-between gap-3">
              <span className={LABEL}>{card.label}</span>
              <span className={`${ICON_WRAP} ${card.tone}`}>
                <Icon name={card.icon} className="icon" />
              </span>
            </div>
            <p className={VALUE}>{card.value}</p>
            <p className={SUB}>{card.sub}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
