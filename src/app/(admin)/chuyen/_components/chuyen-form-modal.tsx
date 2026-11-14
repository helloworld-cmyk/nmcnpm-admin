"use client";

import { Modal } from "@/components/ui/modal";
import {
  coTheCongBo,
  coTheSua,
  homNayISO,
  type ChuyenFormTarget,
  type ChuyenRecord,
  type ChuyenTuyenOption,
  type TaiXeOption,
  type XeOption,
} from "../_data/chuyen";
import type {
  ChuyenFormFields,
  ChuyenFormValues,
} from "../_hooks/use-chuyen-form";
import { ChuyenFormBody } from "./chuyen-form-body";

type ChuyenFormModalProps = {
  target: ChuyenFormTarget | null;
  trips: ChuyenRecord[];
  tuyenOptions: ChuyenTuyenOption[];
  routeDurations: Record<string, number>;
  xeOptions: XeOption[];
  taixeOptions: TaiXeOption[];
  /* Đang gọi API tạo/sửa → chặn gửi trùng ở form. */
  saving?: boolean;
  onClose: () => void;
  onSave: (
    target: ChuyenFormTarget,
    values: ChuyenFormValues,
    publish: boolean
  ) => void;
};

function toFormState(target: ChuyenFormTarget): ChuyenFormFields {
  if (target.mode === "edit") {
    const trip = target.trip;
    return {
      tuyen: trip.tuyenId,
      ngay: trip.ngayISO,
      gio: trip.gio,
      xe: trip.xeId ?? "",
      taixe: trip.taixeId ?? "",
    };
  }
  const prefill = target.prefill ?? {};
  return {
    tuyen: "",
    ngay: prefill.ngayISO ?? homNayISO(),
    gio: prefill.gio ?? "",
    xe: prefill.xe ?? "",
    taixe: prefill.taixe ?? "",
  };
}

export function ChuyenFormModal({
  target,
  trips,
  tuyenOptions,
  routeDurations,
  xeOptions,
  taixeOptions,
  saving = false,
  onClose,
  onSave,
}: ChuyenFormModalProps) {
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="lg"
      title={
        <span className="block">
          {target?.mode === "edit"
            ? coTheSua(target.trip)
              ? `Sửa chuyến ${target.trip.ma}`
              : `Đổi xe và tài xế · ${target.trip.ma}`
            : "Tạo chuyến"}
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            Hệ thống kiểm tra trùng lịch xe/tài xế và sức chứa khi lưu.
          </span>
        </span>
      }
    >
      {target && (
        <ChuyenFormBody
          key={target.mode === "edit" ? `edit:${target.trip.id}` : "create"}
          initial={toFormState(target)}
          editingId={target.mode === "edit" ? target.trip.id : null}
          /* Chuyến đã công bố không sửa được lịch chuyến — chỉ đổi xe/tài xế. */
          scheduleLocked={target.mode === "edit" && !coTheSua(target.trip)}
          canPublish={target.mode === "create" || coTheCongBo(target.trip)}
          trips={trips}
          tuyenOptions={tuyenOptions}
          routeDurations={routeDurations}
          xeOptions={xeOptions}
          taixeOptions={taixeOptions}
          saving={saving}
          onClose={onClose}
          onSave={(values, publish) => onSave(target, values, publish)}
        />
      )}
    </Modal>
  );
}
