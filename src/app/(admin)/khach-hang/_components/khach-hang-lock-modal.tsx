"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import { FormField, Select, TextInput } from "@/components/ui/form";
import { KH_LY_DO_KHOA_OPTIONS, type KhachHang } from "../_data/customers";

type KhachHangLockModalProps = {
  khachHang: KhachHang;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => void;
};

export function KhachHangLockModal({
  khachHang,
  onClose,
  onConfirm,
}: KhachHangLockModalProps) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const reasonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    reasonRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason) {
      setInvalid(true);
      setStatus("Chọn lý do khóa tài khoản trước khi lưu.");
      reasonRef.current?.focus();
      return;
    }
    onConfirm(reason, note);
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={
        <>
          <span className="block">Khóa tài khoản khách hàng?</span>
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            Khóa tài khoản {khachHang.ten}? Khách sẽ không thể đăng nhập và đặt
            vé mới; các vé đã đặt trước đó được giữ nguyên.
          </span>
        </>
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          <button
            type="submit"
            form="kh-lock-form"
            className="btn btn-primary"
          >
            Khóa tài khoản
          </button>
        </>
      }
    >
      <form
        id="kh-lock-form"
        className="kh-lock-form grid gap-3.5"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="kh-warn" role="note">
          <Icon name="i-alert" />
          <p>
            Chỉ khóa khi phát hiện gian lận hoặc theo yêu cầu của khách. Ghi rõ{" "}
            <strong>lý do</strong> để lần sau tra cứu lại được.
          </p>
        </div>

        <FormField
          id="kh-lock-reason"
          label="Lý do khóa"
          required
          invalid={invalid}
        >
          <Select
            ref={reasonRef}
            id="kh-lock-reason"
            value={reason}
            aria-invalid={invalid}
            invalid={invalid}
            placeholder="Chọn lý do khóa..."
            onChange={(value) => {
              setReason(value);
              setInvalid(false);
              setStatus(null);
            }}
            options={[
              { value: "", label: "Chọn lý do khóa..." },
              ...KH_LY_DO_KHOA_OPTIONS.map((option) => ({
                value: option,
                label: option,
              })),
            ]}
          />
        </FormField>

        <FormField id="kh-lock-note" label="Ghi chú thêm (tuỳ chọn)">
          <TextInput
            id="kh-lock-note"
            type="text"
            placeholder="Ví dụ: khách gọi điện báo ngày 30/10"
            autoComplete="off"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </FormField>

        <p
          className={`form-status${status ? " is-error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>
      </form>
    </Modal>
  );
}
