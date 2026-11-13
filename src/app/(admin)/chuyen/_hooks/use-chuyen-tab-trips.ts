"use client";

import { useCancelledTrips } from "@/api/chuyen/tanstack/use-cancelled-trips";
import { useCompletedTrips } from "@/api/chuyen/tanstack/use-completed-trips";
import { useInProgressTrips } from "@/api/chuyen/tanstack/use-in-progress-trips";
import { useUpcomingTrips } from "@/api/chuyen/tanstack/use-upcoming-trips";
import type { TripResponse } from "@/api/chuyen/api/types";
import type { ApiError } from "@/api/types";
import type { ChuyenTab } from "@/global-states/chuyen-filters-store";

type ChuyenTabTrips = {
  /* Danh sách chuyến theo đúng trạng thái của tab; null khi tab "all". */
  raw: TripResponse[] | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
};

/*
 * Nguồn dữ liệu theo tab trạng thái của màn Chuyến: mỗi tab tương ứng một
 * endpoint list riêng (upcoming / in-progress / completed / cancelled). Tab "all"
 * trả raw = null để nơi gọi dùng danh sách chuyến đầy đủ. Chỉ tab đang chọn được
 * bật nên các hook còn lại không phát sinh request.
 */
export function useChuyenTabTrips(
  companyId: string,
  tab: ChuyenTab
): ChuyenTabTrips {
  const hasCompany = companyId.length > 0;
  const isAll = tab === "all";

  const upcoming = useUpcomingTrips(companyId, {
    enabled: hasCompany && tab === "sap-toi",
  });
  const inProgress = useInProgressTrips(companyId, {
    enabled: hasCompany && tab === "dang-thuc-hien",
  });
  const completed = useCompletedTrips(companyId, {
    enabled: hasCompany && tab === "hoan-thanh",
  });
  const cancelled = useCancelledTrips(companyId, {
    enabled: hasCompany && tab === "da-huy",
  });

  if (isAll) {
    return {
      raw: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => {},
    };
  }

  const active =
    tab === "sap-toi"
      ? upcoming
      : tab === "dang-thuc-hien"
        ? inProgress
        : tab === "hoan-thanh"
          ? completed
          : cancelled;

  return {
    raw: active.data ?? null,
    isLoading: active.isLoading,
    isError: active.isError,
    error: active.error,
    refetch: () => {
      void active.refetch();
    },
  };
}
