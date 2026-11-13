"use client";

import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import type { CompanyDriverCredentialResponse } from "@/api/tai-xe/api/types";

type TaiXeCredentialModalProps = {
  credential: CompanyDriverCredentialResponse | null;
  subtitle: string;
  onClose: () => void;
  onCopied: (ok: boolean) => void;
};

const CRED_PANEL =
  "grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-4 py-4";

const CRED_ROW = "grid gap-0.5";

const CRED_DT =
  "text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";

const CRED_DD =
  "[font-family:var(--font-heading)] text-[15px] font-bold text-[var(--ink)] break-all";

export function TaiXeCredentialModal({
  credential,
  subtitle,
  onClose,
  onCopied,
}: TaiXeCredentialModalProps) {
  const copy = async () => {
    if (!credential) return;
    const text =
      `Tài xế: ${credential.fullName}\n` +
      `Tên đăng nhập: ${credential.login}\n` +
      `Mật khẩu tạm: ${credential.temporaryPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      onCopied(true);
    } catch {
      onCopied(false);
    }
  };

  return (
    <Modal
      open={credential !== null}
      onClose={onClose}
      size="sm"
      title="Thông tin đăng nhập"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[var(--green-100)] text-[var(--green-700)]">
          <Icon name="i-check-circle" className="icon h-6 w-6" />
        </span>
        <p className="text-[13.5px] leading-[1.55] text-[var(--slate-500)]">
          {subtitle}
        </p>
      </div>

      <dl className={CRED_PANEL}>
        <div className={CRED_ROW}>
          <dt className={CRED_DT}>Tài xế</dt>
          <dd className={CRED_DD}>{credential?.fullName ?? "—"}</dd>
        </div>
        <div className={CRED_ROW}>
          <dt className={CRED_DT}>Tên đăng nhập (SĐT)</dt>
          <dd className={CRED_DD}>{credential?.login ?? "—"}</dd>
        </div>
        <div className={CRED_ROW}>
          <dt className={CRED_DT}>Mật khẩu tạm</dt>
          <dd className={CRED_DD}>{credential?.temporaryPassword ?? "—"}</dd>
        </div>
      </dl>

      <p className="flex items-start gap-2 text-[12.5px] font-medium leading-[1.5] text-[var(--orange-700)]">
        <Icon name="i-alert" className="icon h-4 w-4 flex-none" />
        Thông tin chỉ hiển thị một lần. Hãy sao chép ngay — mật khẩu tạm sẽ
        không xem lại được sau khi đóng.
      </p>

      <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Xong
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            void copy();
          }}
        >
          <Icon name="i-copy" />
          Sao chép thông tin
        </button>
      </div>
    </Modal>
  );
}
