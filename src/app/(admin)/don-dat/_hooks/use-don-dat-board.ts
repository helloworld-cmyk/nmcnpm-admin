"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";

import { useBooking } from "@/api/don-dat/tanstack/use-booking";
import { useBookingStatistics } from "@/api/don-dat/tanstack/use-booking-statistics";
import { useBookingStatusCounts } from "@/api/don-dat/tanstack/use-booking-status-counts";
import { useBookings } from "@/api/don-dat/tanstack/use-bookings";
import { useCustomer } from "@/api/khach-hang/tanstack/use-customer";
import type {
  CompanyBookingStatisticsResponse,
  ListBookingsQuery,
} from "@/api/don-dat/api/types";
import { ApiError } from "@/api/types";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useDonDatFiltersStore } from "@/global-states/don-dat-filters-store";
import {
  DON_DAT_TAB_VIEW,
  DON_DAT_VIEW_TAB,
  SO_DONG_MOI_TRANG,
  laViewStatus,
} from "../_data/don-dat";
import {
  mapBookingDetail,
  mapBookingRow,
  type DonDatDetail,
  type DonDatRow,
} from "../_utils/map-booking";

function apiMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

/* Đơn đang được hủy (đủ thông tin hiển thị trên hộp thoại xác nhận). */
export type DonDatCancelTarget = { id: string; ma: string; khach: string };

/*
 * Toàn bộ state + nghiệp vụ của màn Đơn đặt (truy vấn danh sách theo tab trạng
 * thái, thống kê, lọc/đếm/phân trang server-side, chi tiết đơn, hủy đơn).
 * Component `DonDatBoard` chỉ còn render UI.
 */
export function useDonDatBoard(initialCustomerId = "", initialViewStatus = "") {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);

  const tab = useDonDatFiltersStore((s) => s.tab);
  const setTab = useDonDatFiltersStore((s) => s.setTab);
  const search = useDonDatFiltersStore((s) => s.search);
  const departureFrom = useDonDatFiltersStore((s) => s.departureFrom);
  const departureTo = useDonDatFiltersStore((s) => s.departureTo);
  const customerId = useDonDatFiltersStore((s) => s.customerId);
  const setCustomerId = useDonDatFiltersStore((s) => s.setCustomerId);
  const page = useDonDatFiltersStore((s) => s.page);
  const setPage = useDonDatFiltersStore((s) => s.setPage);
  const resetFilters = useDonDatFiltersStore((s) => s.reset);
  const deferredSearch = useDeferredValue(search);

  /* Đồng bộ customerId từ query string của URL (link "Xem tất cả đơn đặt" ở màn khách hàng). */
  useEffect(() => {
    setCustomerId(initialCustomerId);
  }, [initialCustomerId, setCustomerId]);

  /* Đồng bộ tab từ query string ?viewStatus=... để deep link mở đúng trạng thái. */
  useEffect(() => {
    if (laViewStatus(initialViewStatus)) {
      setTab(DON_DAT_VIEW_TAB[initialViewStatus]);
    }
  }, [initialViewStatus, setTab]);

  const [toast, setToast] = useState<ToastData | null>(null);
  const handleReset = () => {
    resetFilters();
    setToast({ message: "Đã xóa bộ lọc", type: "info" });
  };

  const sharedFilters: ListBookingsQuery = useMemo(
    () => ({
      q: deferredSearch.trim() || undefined,
      departureFrom: departureFrom || undefined,
      departureTo: departureTo || undefined,
      customerId: customerId || undefined,
    }),
    [deferredSearch, departureFrom, departureTo, customerId]
  );

  /* Chờ đồng bộ customerId từ URL trước khi gọi, tránh tải nhầm toàn bộ đơn của hãng. */
  const queriesEnabled = companyId.length > 0 && customerId !== null;

  const listQuery = useBookings(
    companyId,
    {
      ...sharedFilters,
      viewStatus: tab === "all" ? undefined : DON_DAT_TAB_VIEW[tab],
      page: page - 1,
      size: SO_DONG_MOI_TRANG,
    },
    { placeholderData: keepPreviousData, enabled: queriesEnabled }
  );

  const countsQuery = useBookingStatusCounts(companyId, sharedFilters, {
    enabled: queriesEnabled,
  });
  const statsQuery = useBookingStatistics(companyId);

  const rows = useMemo(
    () => (listQuery.data?.content ?? []).map(mapBookingRow),
    [listQuery.data]
  );

  const totalElements = listQuery.data?.totalElements ?? 0;
  const pageCount = Math.max(listQuery.data?.totalPages ?? 1, 1);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const start = (page - 1) * SO_DONG_MOI_TRANG;

  /* Chi tiết đơn đọc theo id; sau khi hủy sẽ được invalidate nên mở lại là dữ liệu mới. */
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailQuery = useBooking(companyId, detailId ?? "");
  const detail: DonDatDetail | null = useMemo(
    () => (detailQuery.data ? mapBookingDetail(detailQuery.data) : null),
    [detailQuery.data]
  );

  const [cancelTarget, setCancelTarget] = useState<DonDatCancelTarget | null>(
    null
  );

  const openDetail = (row: DonDatRow) => setDetailId(row.id);
  const closeDetail = () => setDetailId(null);

  const openCancelFromTable = (row: DonDatRow) => {
    setCancelTarget({ id: row.id, ma: row.ma, khach: row.khach });
  };
  const openCancelFromDetail = () => {
    if (!detail) return;
    setCancelTarget({ id: detail.id, ma: detail.ma, khach: detail.khach });
    setDetailId(null);
  };
  const closeCancel = () => setCancelTarget(null);

  const counts = countsQuery.data ?? null;
  const statistics: CompanyBookingStatisticsResponse | null =
    statsQuery.data ?? null;

  /* Tên khách đang lọc (chỉ gọi khi có customerId) để hiển thị ngữ cảnh trên toolbar. */
  const customerQuery = useCustomer(companyId, customerId ?? "");
  const customerName = customerQuery.data?.fullName ?? "";

  return {
    companyId,
    companyHydrated,
    tab,
    rows,
    counts,
    statistics,
    countsLoading: countsQuery.isLoading,
    statsLoading: statsQuery.isLoading,
    /* customerId === null nghĩa là chưa đồng bộ URL → coi như đang tải. */
    isLoading: listQuery.isLoading || customerId === null,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    errorText: apiMessage(listQuery.error),
    refetch: () => void listQuery.refetch(),
    page,
    pageCount,
    totalElements,
    rangeStart: rows.length > 0 ? start + 1 : 0,
    rangeEnd: start + rows.length,
    customerId,
    customerName,
    customerLoading: customerQuery.isLoading,
    clearCustomer: () => setCustomerId(""),
    detail,
    detailOpen: detailId !== null,
    detailLoading: detailQuery.isLoading,
    detailError: detailQuery.isError
      ? apiMessage(detailQuery.error)
      : null,
    cancelTarget,
    openDetail,
    closeDetail,
    openCancelFromTable,
    openCancelFromDetail,
    closeCancel,
    toast,
    setToast,
    handleReset,
  };
}
