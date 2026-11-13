"use client";

import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import {
  formatDuration,
  formatMoney,
  type TuyenDuong,
} from "../_data/tuyen-duong";

const PAUSE_BUTTON_CLASS =
  "btn bg-[var(--orange-500)] text-[#10203a] shadow-[0_14px_32px_-14px_rgba(249,115,22,0.85)] hover:-translate-y-px hover:bg-[#fb923c] active:translate-y-0";

const FACT_ROW_CLASS =
  "flex items-center justify-between gap-3 text-[13px] text-[var(--slate-600)]";

type TuyenDuongConfirmModalProps = {
  target: TuyenDuong | null;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TuyenDuongConfirmModal({
  target,
  busy = false,
  onClose,
  onConfirm,
}: TuyenDuongConfirmModalProps) {
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="sm"
      title={
        <span className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-[var(--radius-sm)] bg-[var(--orange-100)] text-[var(--orange-700)]">
            <Icon name="i-alert" className="icon h-[22px] w-[22px]" />
          </span>
          <span className="min-w-0">
            <span className="block">Ngừng sử dụng tuyến?</span>
            <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
              {target
                ? `Tuyến ${target.code} · ${target.from} → ${target.to}`
                : ""}
            </span>
          </span>
        </span>
      }
    >
      {target && (
        <>
          <ul className="grid gap-2 rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--bg)] px-3.5 py-3">
            <li className={FACT_ROW_CLASS}>
              <span>Quãng đường</span>
              <strong className="text-right font-bold text-[var(--ink)]">
                {target.km} km · {formatDuration(target.min)}
              </strong>
            </li>
            <li className={FACT_ROW_CLASS}>
              <span>Giá vé cơ bản</span>
              <strong className="text-right font-bold text-[var(--ink)]">
                {formatMoney(target.price)}
              </strong>
            </li>
            <li className={FACT_ROW_CLASS}>
              <span>Chuyến đã tạo</span>
              <strong className="text-right font-bold text-[var(--ink)]">
                {target.trips} chuyến
              </strong>
            </li>
          </ul>
          <p className="text-[12.5px] leading-[1.55] text-[var(--slate-500)]">
            Chuyến đã tạo và vé đã bán trên tuyến này vẫn giữ nguyên lịch sử.
            Bạn có thể kích hoạt lại tuyến bất kỳ lúc nào.
          </p>
          <div className="flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={busy}
            >
              Giữ tuyến
            </button>
            <button
              type="button"
              className={PAUSE_BUTTON_CLASS}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? "Đang xử lý…" : "Ngừng tuyến"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
