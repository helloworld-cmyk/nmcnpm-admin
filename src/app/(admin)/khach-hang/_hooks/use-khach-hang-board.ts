"use client";

import { useEffect, useMemo, useState } from "react";

import { useCustomer } from "@/api/khach-hang/tanstack/use-customer";
import { useCustomers } from "@/api/khach-hang/tanstack/use-customers";
import { ApiError } from "@/api/types";
import { useCompanyStore } from "@/global-states/company-store";
import { useKhachHangFiltersStore } from "@/global-states/khach-hang-filters-store";
import { coNgay, soSanhNgay } from "../_data/customers";
import { mapCustomerDetail, mapCustomers } from "../_utils/map-customer";

const PAGE_SIZE = 5;

function apiMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

/*
 * Toàn bộ state + nghiệp vụ của màn Khách hàng (truy vấn, lọc/sắp xếp, phân
 * trang, chi tiết). Component `KhachHangBoard` chỉ còn render UI.
 */
export function useKhachHangBoard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useCustomers(companyId);

  const [detailId, setDetailId] = useState<string | null>(null);

  const search = useKhachHangFiltersStore((s) => s.search);
  const trangThai = useKhachHangFiltersStore((s) => s.trangThai);
  const page = useKhachHangFiltersStore((s) => s.page);
  const sortKey = useKhachHangFiltersStore((s) => s.sortKey);
  const sortDir = useKhachHangFiltersStore((s) => s.sortDir);
  const setPage = useKhachHangFiltersStore((s) => s.setPage);

  const customers = useMemo(() => mapCustomers(data ?? []), [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((kh) => {
      const haystack =
        `${kh.ten} ${kh.soDienThoai} ${kh.email}`.toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (!trangThai || kh.trangThai === trangThai)
      );
    });
  }, [customers, search, trangThai]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const direction = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "veDaDat") {
        return (a.veDaDat - b.veDaDat) * direction;
      }
      if (sortKey === "datGanNhat") {
        /* Mốc thiếu/không hợp lệ luôn xuống cuối, không phụ thuộc chiều sắp xếp. */
        const hopLeA = coNgay(a.datGanNhat);
        const hopLeB = coNgay(b.datGanNhat);
        if (hopLeA !== hopLeB) return hopLeA ? -1 : 1;
        const soSanh = soSanhNgay(a.datGanNhat, b.datGanNhat);
        if (soSanh !== 0) return soSanh * direction;
        return a.ten.localeCompare(b.ten, "vi");
      }
      return a.ten.localeCompare(b.ten, "vi") * direction;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const start = (safePage - 1) * PAGE_SIZE;
  /* `veDaDat` lấy thẳng `bookingCount` của danh sách, không join thêm để tránh lệch nghĩa vé/đơn. */
  const rows = sorted.slice(start, start + PAGE_SIZE);

  const detailBase = customers.find((kh) => kh.id === detailId) ?? null;
  const detailQuery = useCustomer(companyId, detailBase?.id ?? "");

  const detail = useMemo(() => {
    if (!detailBase) return null;
    if (!detailQuery.data) return detailBase;
    return {
      ...detailBase,
      ...mapCustomerDetail(detailQuery.data),
    };
  }, [detailBase, detailQuery.data]);

  return {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText: apiMessage(error),
    refetch,
    sorted,
    rows,
    start,
    pageCount,
    safePage,
    detail,
    detailTicketsLoading: detailQuery.isLoading,
    setDetailId,
  };
}
