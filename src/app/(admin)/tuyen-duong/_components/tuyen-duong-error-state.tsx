"use client";

import { Icon } from "@/components/icons/icon";

const STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

type TuyenDuongErrorStateProps = {
  message: string;
  onRetry: () => void;
  retrying: boolean;
};

export function TuyenDuongErrorState({
  message,
  onRetry,
  retrying,
}: TuyenDuongErrorStateProps) {
  return (
    <section aria-label="Lỗi tải dữ liệu" className={STATE_CLASS}>
      <span className="state-empty-icon text-[var(--red-600)]">
        <Icon name="i-alert" />
      </span>
      <h3>Không tải được danh sách tuyến</h3>
      <p>{message}</p>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onRetry}
        disabled={retrying}
      >
        <Icon name="i-refresh" />
        {retrying ? "Đang tải..." : "Thử lại"}
      </button>
    </section>
  );
}
