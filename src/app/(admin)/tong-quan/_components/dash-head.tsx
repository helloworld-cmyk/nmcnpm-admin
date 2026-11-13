"use client";

import { Icon } from "@/components/icons/icon";

const HEAD_CLASS =
  "mb-5 flex items-end justify-between gap-4 max-[640px]:flex-col max-[640px]:items-stretch";

const ACTION_CLASS = "flex flex-none flex-wrap gap-2.5 max-[640px]:[&>*]:flex-1";

const EYEBROW_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky-700)]";

const TITLE_CLASS =
  "mt-1.5 text-[clamp(1.7rem,2.6vw,2.2rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--ink)]";

const LEAD_CLASS = "mt-1.5 text-sm text-[var(--slate-500)]";

/* Ngày hôm nay dạng "Thứ Năm, 12/11/2026" theo locale tiếng Việt. */
function formatToday(): string {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function DashHead({ onRefresh }: { onRefresh: () => void }) {
  const today = formatToday();

  return (
    <div className={HEAD_CLASS}>
      <div>
        <p className={EYEBROW_CLASS}>Bảng điều khiển</p>
        <h1 className={TITLE_CLASS}>Tổng quan</h1>
        <p className={LEAD_CLASS}>Sức khoẻ nền tảng hôm nay · {today}</p>
      </div>
      <div className={ACTION_CLASS}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRefresh}>
          <Icon name="i-refresh" className="icon" />
          Làm mới
        </button>
      </div>
    </div>
  );
}
