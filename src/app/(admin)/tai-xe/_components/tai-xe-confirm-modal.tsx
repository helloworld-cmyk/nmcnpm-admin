"use client";

import { Modal } from "@/components/ui/modal";
import type { TaiXe } from "../_utils/tai-xe";
import type { TaiXeConfirmMode } from "../_utils/tai-xe-form";
import { TaiXeConfirmBody } from "./tai-xe-confirm-body";

export type { TaiXeConfirmMode };

type TaiXeConfirmModalProps = {
  mode: TaiXeConfirmMode | null;
  taiXe: TaiXe | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
};

const TITLE: Record<TaiXeConfirmMode, string> = {
  lock: "Khóa tài khoản tài xế?",
  unlock: "Mở khóa tài khoản?",
  reset: "Đặt lại mật khẩu?",
};

export function TaiXeConfirmModal({
  mode,
  taiXe,
  saving,
  onClose,
  onConfirm,
}: TaiXeConfirmModalProps) {
  return (
    <Modal
      open={mode !== null && taiXe !== null}
      onClose={onClose}
      size="sm"
      title={mode ? TITLE[mode] : ""}
    >
      <TaiXeConfirmBody
        key={`${mode}:${taiXe?.id ?? ""}`}
        mode={mode}
        taiXe={taiXe}
        saving={saving}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}
