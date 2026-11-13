"use client";

import { Modal } from "@/components/ui/modal";
import type { XeSeatTarget } from "../_data/seats";
import { XeSeatBody } from "./xe-seat-body";

type XeSeatModalProps = {
  target: XeSeatTarget | null;
  companyId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function XeSeatModal({
  target,
  companyId,
  onClose,
  onSaved,
}: XeSeatModalProps) {
  const open = target !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        target ? (
          <>
            <span className="block">Cấu hình ghế ngồi · {target.bienSo}</span>
            <span className="mt-1 block text-[12.5px] font-medium tracking-normal text-[var(--slate-500)]">
              {target.loaiXe}
            </span>
          </>
        ) : (
          "Cấu hình ghế ngồi"
        )
      }
    >
      {open && target ? (
        <XeSeatBody
          key={target.vehicleId}
          companyId={companyId}
          target={target}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}
