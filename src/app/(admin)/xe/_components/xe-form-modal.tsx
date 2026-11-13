"use client";

import { Modal } from "@/components/ui/modal";
import {
  EMPTY_XE_FORM,
  toXeFormState,
  type XeFormTarget,
} from "../_utils/xe-form";
import type { Xe, XeFormValues } from "../_data/vehicles";
import { XeFormBody } from "./xe-form-body";

type XeFormModalProps = {
  target: XeFormTarget | null;
  vehicles: Xe[];
  onClose: () => void;
  onSave: (values: XeFormValues) => void;
};

const TITLE_HINT_CLASS = [
  "mt-1 block text-[12.5px] font-medium leading-snug",
  "tracking-normal text-[var(--slate-500)]",
].join(" ");

export function XeFormModal({
  target,
  vehicles,
  onClose,
  onSave,
}: XeFormModalProps) {
  const isEdit = target?.mode === "edit";
  const initial =
    target && target.mode === "edit" ? toXeFormState(target.xe) : EMPTY_XE_FORM;

  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="md"
      title={
        <>
          <span className="block">
            {isEdit && target && target.mode === "edit"
              ? `Cập nhật xe ${target.xe.bienSo}`
              : "Thêm xe mới"}
          </span>
          <span className={TITLE_HINT_CLASS}>
            Xe thêm mới sẽ khả dụng để phân công khi đang ở tình trạng hoạt
            động.
          </span>
        </>
      }
    >
      <XeFormBody
        key={
          target
            ? `${target.mode}:${target.mode === "edit" ? target.xe.id : ""}`
            : "closed"
        }
        initial={initial}
        isEdit={Boolean(isEdit)}
        excludeId={target && target.mode === "edit" ? target.xe.id : undefined}
        capacityLocked={Boolean(
          target && target.mode === "edit" && target.xe.seatLayoutId
        )}
        vehicles={vehicles}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}
