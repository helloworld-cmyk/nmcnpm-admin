"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { FormField, TextInput } from "@/components/ui/form";
import type { TaiXe } from "../_utils/tai-xe";
import type { TaiXeConfirmMode } from "../_utils/tai-xe-form";

const SUBMIT_LABEL: Record<TaiXeConfirmMode, string> = {
  lock: "Khóa tài khoản",
  unlock: "Mở khóa",
  reset: "Đặt lại mật khẩu",
};

const NOTE_LABEL: Record<TaiXeConfirmMode, string> = {
  lock: "Lý do khóa (không bắt buộc)",
  unlock: "Ghi chú (không bắt buộc)",
  reset: "Ghi chú (không bắt buộc)",
};

const ACCENT_BUTTON = "btn btn-accent";

const DANGER_BUTTON =
  "btn bg-[var(--red-600)] text-white hover:-translate-y-px active:translate-y-0";

function description(mode: TaiXeConfirmMode, taiXe: TaiXe | null): string {
  const name = taiXe?.ten ?? "Tài xế";
  if (mode === "lock") {
    return `${name} sẽ không thể được phân công chuyến mới. Các chuyến đã phân công gần đây không thay đổi.`;
  }
  if (mode === "unlock") {
    return `${name} sẽ hoạt động trở lại và có thể được phân công chuyến.`;
  }
  return `Mật khẩu tạm mới của ${name} sẽ hiển thị một lần để bàn giao lại.`;
}

type TaiXeConfirmBodyProps = {
  mode: TaiXeConfirmMode | null;
  taiXe: TaiXe | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
};

export function TaiXeConfirmBody({
  mode,
  taiXe,
  saving,
  onClose,
  onConfirm,
}: TaiXeConfirmBodyProps) {
  const [note, setNote] = useState("");

  if (!mode) return null;

  return (
    <>
      <p className="text-[13.5px] leading-[1.55] text-[var(--slate-500)]">
        {description(mode, taiXe)}
      </p>

      <FormField id="tx-confirm-note" label={NOTE_LABEL[mode]}>
        <TextInput
          id="tx-confirm-note"
          type="text"
          placeholder="VD: Tạm khóa theo yêu cầu điều phối"
          autoComplete="off"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>

      <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={saving}
        >
          Hủy
        </button>
        <button
          type="button"
          className={`${mode === "unlock" ? "btn btn-primary" : mode === "lock" ? ACCENT_BUTTON : DANGER_BUTTON}${saving ? " is-loading" : ""}`}
          disabled={saving}
          onClick={() => onConfirm(note)}
        >
          {mode === "reset" ? <Icon name="i-refresh" /> : null}
          {SUBMIT_LABEL[mode]}
        </button>
      </div>
    </>
  );
}
