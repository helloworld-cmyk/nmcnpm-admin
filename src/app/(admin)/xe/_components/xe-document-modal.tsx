"use client";

import { Modal } from "@/components/ui/modal";
import type { XeDocumentTarget } from "../_data/documents";
import { XeDocumentBody } from "./xe-document-body";

type XeDocumentModalProps = {
  target: XeDocumentTarget | null;
  companyId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function XeDocumentModal({
  target,
  companyId,
  onClose,
  onSaved,
}: XeDocumentModalProps) {
  const open = target !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        target ? (
          <>
            <span className="block">Giấy tờ xe · {target.bienSo}</span>
            <span className="mt-1 block text-[12.5px] font-medium tracking-normal text-[var(--slate-500)]">
              {target.loaiXe}
            </span>
          </>
        ) : (
          "Giấy tờ xe"
        )
      }
    >
      {open && target ? (
        <XeDocumentBody
          key={target.vehicleId}
          companyId={companyId}
          vehicleId={target.vehicleId}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}
