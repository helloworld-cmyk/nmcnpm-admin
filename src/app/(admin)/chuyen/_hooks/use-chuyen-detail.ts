"use client";

import { useMemo } from "react";

import { useTrip } from "@/api/chuyen/tanstack/use-trip";
import { ApiError } from "@/api/types";
import { useCompanyStore } from "@/global-states/company-store";

import type { VeItem } from "../_data/chuyen";
import { mapDetailPassengers } from "../_utils/map-trip";

/*
 * Dữ liệu chi tiết một chuyến cho ngăn kéo, lấy từ một request duy nhất
 * `GET /bus-companies/{id}/trips/{tripId}` (TripDetailResponse): vé/hành khách,
 * phân công xe + tài xế, số ghế và lịch sử trạng thái. Chỉ gọi API khi mở chuyến.
 */
export function useChuyenDetail(tripId: string) {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";

  const query = useTrip(companyId, tripId);
  const detail = query.data ?? null;

  const veList = useMemo<VeItem[]>(
    () => mapDetailPassengers(detail?.passengers ?? []),
    [detail]
  );

  return {
    detail,
    veList,
    isLoading: query.isLoading,
    isError: query.isError,
    errorText:
      query.error instanceof ApiError
        ? query.error.message
        : "Không tải được chi tiết chuyến.",
    refetch: query.refetch,
  };
}
