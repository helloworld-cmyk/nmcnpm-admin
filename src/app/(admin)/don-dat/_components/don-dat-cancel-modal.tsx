"use client";

import { Icon } from "@/components/icons/icon";
import { FormField, TextArea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useDonDatCancel } from "../_hooks/use-don-dat-cancel";
import type { DonDatCancelTarget } from "../_hooks/use-don-dat-board";

type DonDatCancelFormProps = {
  companyId: string;
  target: DonDatCancelTarget;
  onClose: () => void;
  onDone: (message: string) => void;
};

function DonDatCancelForm({
  companyId,
  target,
  onClose,
  onDone,
}: DonDatCancelFormProps) {
  const { reason, error, maxLength, submitting, patchReason, submit } =
    useDonDatCancel({ companyId, target, onDone });

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="text-[13.5px] leading-[1.6] text-[var(--slate-600)]">
        Hủy đơn{" "}
        <strong className="text-[var(--ink)]">{target.ma}</strong> của khách{" "}
        <strong className="text-[var(--ink)]">{target.khach}</strong>. Vé liên
        quan sẽ được giải phóng ghế và chuyển sang trạng thái Đã hủy.
      </p>

      <FormField
        id="dd-ly-do-huy"
        label="Lý do hủy"
        required
        invalid={Boolean(error)}
        hint={`${reason.trim().length}/${maxLength} ký tự`}
      >
        <TextArea
          id="dd-ly-do-huy"
          placeholder="VD: Khách yêu cầu hủy, thay đổi kế hoạch..."
          aria-invalid={Boolean(error)}
          invalid={Boolean(error)}
          value={reason}
          maxLength={maxLength}
          onChange={(event) => patchReason(event.target.value)}
        />
      </FormField>

      {error ? (
        <p className="form-status is-error" role="status" aria-live="polite">
          <Icon name="i-alert" className="icon h-4 w-4" />
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Giữ đơn
        </button>
        <button type="submit" className="btn btn-danger" disabled={submitting}>
          {submitting ? "Đang hủy..." : "Xác nhận hủy đơn"}
        </button>
      </div>
    </form>
  );
}

type DonDatCancelModalProps = {
  companyId: string;
  target: DonDatCancelTarget | null;
  onClose: () => void;
  onDone: (message: string) => void;
};

export function DonDatCancelModal({
  companyId,
  target,
  onClose,
  onDone,
}: DonDatCancelModalProps) {
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="sm"
      title="Hủy đơn đặt vé"
    >
      {target ? (
        <DonDatCancelForm
          key={target.id}
          companyId={companyId}
          target={target}
          onClose={onClose}
          onDone={onDone}
        />
      ) : null}
    </Modal>
  );
}
