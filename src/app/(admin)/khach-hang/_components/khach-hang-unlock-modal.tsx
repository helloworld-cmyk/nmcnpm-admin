"use client";

import { Modal } from "@/components/ui/modal";
import type { KhachHang } from "../_data/customers";

type KhachHangUnlockModalProps = {
  khachHang: KhachHang;
  onClose: () => void;
  onConfirm: () => void;
};

export function KhachHangUnlockModal({
  khachHang,
  onClose,
  onConfirm,
}: KhachHangUnlockModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={
        <>
          <span className="block">Mở khóa tài khoản?</span>
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            Mở khóa cho {khachHang.ten}? Khách có thể đăng nhập và đặt vé trở
            lại ngay sau đó.
          </span>
        </>
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Mở khóa
          </button>
        </>
      }
    >
      <p className="text-[13.5px] leading-relaxed text-[var(--slate-600)]">
        Lý do khóa hiện tại sẽ được xóa khỏi hồ sơ tài khoản sau khi mở khóa.
      </p>
    </Modal>
  );
}
