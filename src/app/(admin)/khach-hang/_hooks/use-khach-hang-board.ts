"use client";

import { useEffect, useMemo, useState } from "react";

import { useCustomer } from "@/api/khach-hang/tanstack/use-customer";
import { useCustomers } from "@/api/khach-hang/tanstack/use-customers";
import { ApiError } from "@/api/types";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useKhachHangFiltersStore } from "@/global-states/khach-hang-filters-store";
import { soSanhNgay, type KhachHang } from "../_data/customers";
import { mapCustomerDetail, mapCustomers } from "../_utils/map-customer";

const PAGE_SIZE = 5;

export type KhachHangModalKind = "lock" | "unlock" | "pass";

function apiMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

/*
 * Toàn bộ state + nghiệp vụ của màn Khách hàng (truy vấn, lọc/sắp xếp, phân
 * trang, chi tiết, khóa/mở khóa/đặt lại mật khẩu). Component `KhachHangBoard`
 * chỉ còn render UI.
 */
export function useKhachHangBoard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useCustomers(companyId);

  /* Khóa/mở khóa chưa có API backend — giữ cục bộ theo phiên. */
  const [overrides, setOverrides] = useState<Record<string, Partial<KhachHang>>>(
    {}
  );
  const [detailId, setDetailId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<KhachHangModalKind | null>(
    null
  );
  const [toast, setToast] = useState<ToastData | null>(null);

  const search = useKhachHangFiltersStore((s) => s.search);
  const trangThai = useKhachHangFiltersStore((s) => s.trangThai);
  const page = useKhachHangFiltersStore((s) => s.page);
  const sortKey = useKhachHangFiltersStore((s) => s.sortKey);
  const sortDir = useKhachHangFiltersStore((s) => s.sortDir);
  const setPage = useKhachHangFiltersStore((s) => s.setPage);

  const customers = useMemo(() => {
    const mapped = mapCustomers(data ?? []);
    return mapped.map((kh) =>
      overrides[kh.id] ? { ...kh, ...overrides[kh.id] } : kh
    );
  }, [data, overrides]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((kh) => {
      const haystack =
        `${kh.ten} ${kh.soDienThoai} ${kh.email} ${kh.maKhach}`.toLowerCase();
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
      if (sortKey === "ngayTao") {
        return soSanhNgay(a.ngayTao, b.ngayTao) * direction;
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
  const rows = sorted.slice(start, start + PAGE_SIZE);

  const detailBase = customers.find((kh) => kh.id === detailId) ?? null;
  const detailQuery = useCustomer(companyId, detailBase?.id ?? "");

  const detail = useMemo(() => {
    if (!detailBase) return null;
    if (!detailQuery.data) return detailBase;
    return {
      ...detailBase,
      ...mapCustomerDetail(detailQuery.data),
      ...overrides[detailBase.id],
    };
  }, [detailBase, detailQuery.data, overrides]);

  const setOverride = (id: string, patch: Partial<KhachHang>) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleLock = (reason: string, note: string) => {
    if (!detail) return;
    const ghiChu = note.trim();
    const lyDo = ghiChu ? `${reason} — ${ghiChu}` : reason;
    setOverride(detail.id, { trangThai: "locked", lyDoKhoa: lyDo });
    setActiveModal(null);
    setToast({
      message: `Đã khóa tài khoản ${detail.ten} (lưu tạm — backend chưa hỗ trợ).`,
      type: "success",
    });
  };

  const handleUnlock = () => {
    if (!detail) return;
    setOverride(detail.id, { trangThai: "active", lyDoKhoa: null });
    setActiveModal(null);
    setToast({
      message: `Đã mở khóa tài khoản ${detail.ten} (lưu tạm — backend chưa hỗ trợ).`,
      type: "success",
    });
  };

  const handlePassGenerated = () => {
    if (!detail) return;
    setToast({
      message: `Đã đặt lại mật khẩu cho ${detail.ten} (lưu tạm — backend chưa hỗ trợ).`,
      type: "success",
    });
  };

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
    detailId,
    setDetailId,
    activeModal,
    setActiveModal,
    toast,
    setToast,
    handleLock,
    handleUnlock,
    handlePassGenerated,
  };
}
