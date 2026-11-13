"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import type { ApiError } from "@/api/types";

type DashStatesProps = {
  error?: ApiError | null;
  onReload: () => void;
};

const COPY = {
  role: "alert",
  icon: "i-alert",
  iconClass:
    "bg-[var(--red-50)] text-[var(--red-600)] shadow-[inset_0_0_0_1px_rgba(220,38,38,0.18)]",
  title: "Không tải được bảng điều khiển",
  message:
    "Không kết nối được tới máy chủ dữ liệu. Vui lòng kiểm tra kết nối mạng rồi thử lại.",
  actionText: "Thử lại",
  linkHref: "/chuyen",
  linkText: "Báo cáo sự cố",
} as const;

/* Ưu tiên thông báo lỗi thật từ backend; chỉ kèm mã HTTP khi có. */
function resolveMessage(error?: ApiError | null): string {
  if (error?.message) {
    return error.status ? `${error.message} (HTTP ${error.status})` : error.message;
  }
  return COPY.message;
}

const STATE_CLASS = "py-[clamp(36px,6vw,72px)] text-center";

const ICON_CLASS =
  "mx-auto grid h-16 w-16 place-items-center rounded-[var(--radius-lg)]";

const TITLE_CLASS =
  "mt-[18px] text-[clamp(1.4rem,2.4vw,1.9rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-[var(--ink)]";

const MESSAGE_CLASS =
  "mx-auto mt-3 max-w-[470px] text-[14.5px] leading-[1.7] text-[var(--slate-600)]";

const ACTION_CLASS =
  "mt-[26px] flex flex-wrap justify-center gap-3 max-[640px]:[&>*]:w-full";

export function DashStates({ error, onReload }: DashStatesProps) {
  return (
    <div className={STATE_CLASS} role={COPY.role}>
      <span className={`${ICON_CLASS} ${COPY.iconClass}`} aria-hidden="true">
        <Icon name={COPY.icon} className="h-[27px] w-[27px] flex-none" />
      </span>
      <h2 className={TITLE_CLASS}>{COPY.title}</h2>
      <p className={MESSAGE_CLASS}>{resolveMessage(error)}</p>
      <div className={ACTION_CLASS}>
        <button type="button" className="btn btn-primary" onClick={onReload}>
          {COPY.actionText}
        </button>
        <Link href={COPY.linkHref} className="btn btn-ghost">
          {COPY.linkText}
        </Link>
      </div>
    </div>
  );
}
