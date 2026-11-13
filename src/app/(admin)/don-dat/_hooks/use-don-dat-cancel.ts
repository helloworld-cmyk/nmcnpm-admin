"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCancelBooking } from "@/api/don-dat/tanstack/use-cancel-booking";
import { ApiError } from "@/api/types";
import { LY_DO_HUY_MAX } from "../_data/don-dat";
import type { DonDatCancelTarget } from "./use-don-dat-board";

type UseDonDatCancelOptions = {
  companyId: string;
  target: DonDatCancelTarget;
  onDone: (message: string) => void;
};

/*
 * State + nghiệp vụ hộp thoại hủy đơn: giữ lý do (bắt buộc, tối đa 500 ký tự),
 * gọi API hủy và làm mới danh sách/đếm/chi tiết. Component chỉ render UI.
 */
export function useDonDatCancel({
  companyId,
  target,
  onDone,
}: UseDonDatCancelOptions) {
  const queryClient = useQueryClient();
  const cancel = useCancelBooking(companyId);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const patchReason = (value: string) => {
    setReason(value);
    setError(null);
  };

  const submit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    if (trimmed.length > LY_DO_HUY_MAX) {
      setError(`Lý do tối đa ${LY_DO_HUY_MAX} ký tự.`);
      return;
    }
    try {
      await cancel.mutateAsync({
        bookingId: target.id,
        payload: { reason: trimmed },
      });
      await queryClient.invalidateQueries({ queryKey: ["company-bookings"] });
      await queryClient.invalidateQueries({
        queryKey: ["company-booking-status-counts"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["company-booking-statistics"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["company-booking", companyId, target.id],
      });
      onDone(
        `Đã hủy đơn ${target.ma}. Vé liên quan đã chuyển sang trạng thái Đã hủy.`
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Có lỗi xảy ra, vui lòng thử lại."
      );
    }
  };

  return {
    reason,
    error,
    maxLength: LY_DO_HUY_MAX,
    submitting: cancel.isPending,
    patchReason,
    submit,
  };
}
