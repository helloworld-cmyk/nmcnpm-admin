"use client";

import { Modal } from "@/components/ui/modal";
import type { AreaResponse } from "@/api/area/api/get-areas";
import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import { nextRouteCode, type TuyenDuongFormValues } from "../_data/tuyen-duong";
import {
  EMPTY_TUYEN_DUONG_FORM,
  toTuyenDuongFormState,
  type TuyenDuongFormTarget,
} from "../_utils/tuyen-duong-form";
import { TuyenDuongFormBody } from "./tuyen-duong-form-body";

type TuyenDuongFormModalProps = {
  target: TuyenDuongFormTarget | null;
  routes: RouteResponse[];
  areas: AreaResponse[];
  areasLoading: boolean;
  areasError: boolean;
  areasErrorText: string;
  areasRetrying: boolean;
  onRetryAreas: () => void;
  onClose: () => void;
  onSave: (values: TuyenDuongFormValues) => Promise<void>;
};

export function TuyenDuongFormModal({
  target,
  routes,
  areas,
  areasLoading,
  areasError,
  areasErrorText,
  areasRetrying,
  onRetryAreas,
  onClose,
  onSave,
}: TuyenDuongFormModalProps) {
  const isEdit = target?.mode === "edit";

  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="md"
      title={
        <>
          <span className="block">
            {isEdit && target && target.mode === "edit"
              ? `Sửa tuyến ${target.route.code}`
              : "Thêm tuyến mới"}
          </span>
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            {isEdit && target && target.mode === "edit"
              ? "Cập nhật điểm đi – điểm đến, quãng đường và giá vé của tuyến."
              : "Tuyến mới mặc định ở trạng thái Đang chạy sau khi lưu."}
          </span>
        </>
      }
    >
      <TuyenDuongFormBody
        key={
          target
            ? `${target.mode}:${target.mode === "edit" ? target.route.id : ""}`
            : "closed"
        }
        initial={
          target && target.mode === "edit"
            ? toTuyenDuongFormState(target.route)
            : { ...EMPTY_TUYEN_DUONG_FORM, code: nextRouteCode(routes.map((r) => r.code)) }
        }
        isEdit={Boolean(isEdit)}
        excludeId={target && target.mode === "edit" ? target.route.id : undefined}
        routes={routes}
        areas={areas}
        areasLoading={areasLoading}
        areasError={areasError}
        areasErrorText={areasErrorText}
        areasRetrying={areasRetrying}
        onRetryAreas={onRetryAreas}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}
