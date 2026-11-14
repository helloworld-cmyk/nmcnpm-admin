"use client";

import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import type { Xe } from "../_data/vehicles";

const DANGER_BUTTON_CLASS = [
  "btn bg-[var(--red-600)] text-white",
  "hover:-translate-y-px",
  "hover:shadow-[0_14px_28px_-14px_rgba(220,38,38,0.75)]",
  "active:translate-y-0",
].join(" ");

type XeDeleteModalProps = {
  target: Xe | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function XeDeleteModal({
  target,
  onClose,
  onConfirm,
}: XeDeleteModalProps) {
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="sm"
      title="Xóa xe khỏi đội xe?"
    >
      <p className="text-[13.5px] leading-[1.55] text-[var(--slate-500)]">
        Xe biển số{" "}
        <strong className="font-bold text-[var(--ink)]">
          {target?.bienSo}
        </strong>{" "}
        sẽ bị xóa khỏi đội xe. Nếu xe đã từng được phân công chuyến, hệ thống
        chỉ chuyển xe sang{" "}
        <strong className="font-bold text-[var(--ink)]">Ngưng sử dụng</strong>.
      </p>
      <div className="flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Giữ xe
        </button>
        <button type="button" className={DANGER_BUTTON_CLASS} onClick={onConfirm}>
          <Icon name="i-trash" />
          Xóa xe
        </button>
      </div>
    </Modal>
  );
}
