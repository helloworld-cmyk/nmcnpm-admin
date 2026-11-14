"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";

import { useCreateDriver } from "@/api/tai-xe/tanstack/use-create-driver";
import { useDriver } from "@/api/tai-xe/tanstack/use-driver";
import { useDriverTrips } from "@/api/tai-xe/tanstack/use-driver-trips";
import { useDrivers } from "@/api/tai-xe/tanstack/use-drivers";
import { useResetDriverPassword } from "@/api/tai-xe/tanstack/use-reset-driver-password";
import { useUpdateDriver } from "@/api/tai-xe/tanstack/use-update-driver";
import { useUpdateDriverStatus } from "@/api/tai-xe/tanstack/use-update-driver-status";
import type { CompanyDriverCredentialResponse } from "@/api/tai-xe/api/types";
import { ApiError } from "@/api/types";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useTaiXeFiltersStore } from "@/global-states/tai-xe-filters-store";
import { mapDriver, mapDrivers } from "../_utils/map-driver";
import { TAI_XE_PAGE_SIZE, computePageCount } from "../_utils/tai-xe-list";
import type {
  TaiXeConfirmMode,
  TaiXeFormTarget,
  TaiXeFormValues,
} from "../_utils/tai-xe-form";
import type { UpdateDriverPayload } from "@/api/tai-xe/api/types";
import type { TaiXe } from "../_utils/tai-xe";

function apiMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

/*
 * Toàn bộ state + nghiệp vụ của màn Tài xế (truy vấn, lọc, phân trang, thao tác
 * tạo/sửa/khóa/mở/đặt lại mật khẩu). Component `TaiXeBoard` chỉ còn render UI.
 */
export function useTaiXeBoard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);
  const queryClient = useQueryClient();

  const search = useTaiXeFiltersStore((s) => s.search);
  const trangThai = useTaiXeFiltersStore((s) => s.trangThai);
  const page = useTaiXeFiltersStore((s) => s.page);
  const setPage = useTaiXeFiltersStore((s) => s.setPage);
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, isError, error, isFetching, refetch } = useDrivers(
    companyId,
    {
      search: deferredSearch.trim() || undefined,
      status: trangThai || undefined,
      page: page - 1,
      size: TAI_XE_PAGE_SIZE,
    },
    /* Giữ dữ liệu trang trước khi đổi lọc/tìm kiếm → bảng không nhấp nháy. */
    { placeholderData: keepPreviousData }
  );

  const createDriver = useCreateDriver(companyId);
  const updateDriver = useUpdateDriver(companyId);
  const updateDriverStatus = useUpdateDriverStatus(companyId);
  const resetDriverPassword = useResetDriverPassword(companyId);

  const [formTarget, setFormTarget] = useState<TaiXeFormTarget | null>(null);
  const [detail, setDetail] = useState<TaiXe | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TaiXe | null>(null);
  const [confirmMode, setConfirmMode] = useState<TaiXeConfirmMode | null>(null);
  const [credential, setCredential] =
    useState<CompanyDriverCredentialResponse | null>(null);
  const [credentialSubtitle, setCredentialSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const drivers = useMemo(() => mapDrivers(data?.content ?? []), [data]);

  const totalElements = data?.totalElements ?? 0;
  const pageCount = Math.max(
    computePageCount(totalElements, TAI_XE_PAGE_SIZE),
    data?.totalPages ?? 1
  );
  /* `page` (nguồn duy nhất) được dùng cho cả query lẫn range; khi vượt pageCount
     effect sẽ kéo về trang cuối → query và range luôn cùng nhịp. */
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const start = (page - 1) * TAI_XE_PAGE_SIZE;

  const detailTrips = useDriverTrips(companyId, detail?.id ?? "", 0, 5);

  /* Chi tiết tài xế đọc từ API theo id; sau thao tác ghi (sửa/khóa/đặt lại) sẽ
     được invalidate nên mở lại là dữ liệu mới, kể cả trong khoảng staleTime. */
  const detailQuery = useDriver(companyId, detail?.id ?? "");
  const detailTaiXe = useMemo(
    () => (detailQuery.data ? mapDriver(detailQuery.data) : null),
    [detailQuery.data]
  );

  /* Làm mới danh sách; khi có `driverId` thì làm mới luôn chi tiết + chuyến của
     tài xế đó — cần thiết khi sửa/khóa từ modal chi tiết đã đóng. */
  const invalidate = (driverId?: string) => {
    void queryClient.invalidateQueries({
      queryKey: ["company-drivers", companyId],
    });
    if (driverId) {
      void queryClient.invalidateQueries({
        queryKey: ["company-driver", companyId, driverId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["company-driver-trips", companyId, driverId],
      });
    }
  };

  const openConfirm = (mode: TaiXeConfirmMode, taiXe: TaiXe) => {
    setConfirmTarget(taiXe);
    setConfirmMode(mode);
  };

  const closeConfirm = () => {
    setConfirmMode(null);
    setConfirmTarget(null);
  };

  const openStatusConfirm = (taiXe: TaiXe) => {
    openConfirm(taiXe.trangThai === "locked" ? "unlock" : "lock", taiXe);
  };

  const handleSave = async (
    values: TaiXeFormValues | Partial<TaiXeFormValues>
  ) => {
    if (!companyId) return;
    /* Chụp id ngay từ đầu: modal chi tiết đã đóng trước khi lưu nên không thể
       dựa vào state `detail` để biết cần làm mới chi tiết nào. */
    const editingId =
      formTarget?.mode === "edit" ? formTarget.taiXe.id : undefined;
    const editingTen =
      formTarget?.mode === "edit" ? formTarget.taiXe.ten : "";
    setSaving(true);
    try {
      if (editingId) {
        /* Edit: PATCH partial — chỉ chứa các field đã thay đổi. */
        await updateDriver.mutateAsync({
          driverId: editingId,
          payload: values as UpdateDriverPayload,
        });
        setToast({
          message: `Đã cập nhật thông tin của ${
            (values as Partial<TaiXeFormValues>).fullName ?? editingTen
          }.`,
          type: "success",
        });
      } else {
        const result = await createDriver.mutateAsync(
          values as TaiXeFormValues
        );
        setCredentialSubtitle(
          "Tài khoản đã sẵn sàng — sao chép và bàn giao cho tài xế."
        );
        setCredential(result);
        setPage(1);
        setToast({
          message: `Đã tạo tài khoản cho ${(values as TaiXeFormValues).fullName}.`,
          type: "success",
        });
      }
      invalidate(editingId);
      setFormTarget(null);
    } catch (err) {
      setToast({ message: apiMessage(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (note: string) => {
    if (!companyId || !confirmTarget || !confirmMode) return;
    const target = confirmTarget;
    setSaving(true);
    try {
      if (confirmMode === "reset") {
        const result = await resetDriverPassword.mutateAsync({
          driverId: target.id,
          payload: { note: note.trim() || undefined },
        });
        setCredentialSubtitle(
          "Bàn giao mật khẩu tạm mới cho tài xế — chỉ hiển thị một lần."
        );
        setCredential(result);
        setToast({
          message: `Đã đặt lại mật khẩu cho ${target.ten}.`,
          type: "success",
        });
      } else {
        const status = confirmMode === "lock" ? "LOCKED" : "ACTIVE";
        await updateDriverStatus.mutateAsync({
          driverId: target.id,
          payload: { status, note: note.trim() || undefined },
        });
        setDetail((prev) =>
          prev && prev.id === target.id
            ? {
                ...prev,
                trangThai: confirmMode === "lock" ? "locked" : "active",
              }
            : prev
        );
        setToast({
          message:
            confirmMode === "lock"
              ? `Đã khóa tài khoản của ${target.ten}.`
              : `Đã mở khóa tài khoản của ${target.ten}.`,
          type: "success",
        });
      }
      invalidate(target.id);
      closeConfirm();
    } catch (err) {
      setToast({ message: apiMessage(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText: apiMessage(error),
    refetch,
    drivers,
    totalElements,
    pageCount,
    page,
    start,
    detailTrips,
    detailTaiXe,
    detailLoading: detailQuery.isFetching,
    formTarget,
    setFormTarget,
    detail,
    setDetail,
    confirmTarget,
    confirmMode,
    openConfirm,
    closeConfirm,
    credential,
    setCredential,
    credentialSubtitle,
    saving,
    toast,
    setToast,
    handleSave,
    handleConfirm,
    openStatusConfirm,
  };
}
