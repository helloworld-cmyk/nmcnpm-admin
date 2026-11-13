"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { KhachHang } from "../_data/customers";

type KhachHangPassModalProps = {
  khachHang: KhachHang;
  onClose: () => void;
  onGenerated: () => void;
};

function taoMatKhauTam(): string {
  return `Vv${Math.floor(100000 + Math.random() * 899999)}`;
}

export function KhachHangPassModal({
  khachHang,
  onClose,
  onGenerated,
}: KhachHangPassModalProps) {
  const [tempPass, setTempPass] = useState<string | null>(null);

  const handleGenerate = () => {
    setTempPass(taoMatKhauTam());
    onGenerated();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={
        <>
          <span className="block">Đặt lại mật khẩu khách hàng?</span>
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            Hệ thống tạo một mật khẩu tạm và chỉ hiển thị một lần để bạn bàn
            giao cho khách.
          </span>
        </>
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
          >
            Tạo mật khẩu tạm
          </button>
        </>
      }
    >
      <p
        className={`form-status${tempPass ? " is-success" : " is-info"}`}
        role="status"
        aria-live="polite"
      >
        {tempPass
          ? `Mật khẩu tạm cho ${khachHang.ten}: ${tempPass} — chỉ hiển thị một lần, hãy bàn giao ngay cho khách.`
          : "Nhấn “Tạo mật khẩu tạm” để sinh mật khẩu mới cho khách."}
      </p>
    </Modal>
  );
}
