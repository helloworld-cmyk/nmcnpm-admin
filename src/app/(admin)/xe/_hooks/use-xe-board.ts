"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCreateVehicle } from "@/api/xe/tanstack/use-create-vehicle";
import { useDeleteVehicle } from "@/api/xe/tanstack/use-delete-vehicle";
import { useUpdateVehicle } from "@/api/xe/tanstack/use-update-vehicle";
import { useVehicles } from "@/api/xe/tanstack/use-vehicles";
import { useDrivers } from "@/api/tai-xe/tanstack/use-drivers";
import { ApiError } from "@/api/types";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";
import type {
  Xe,
  XeDriverOption,
  XeFormValues,
} from "../_data/vehicles";
import {
  XE_TRANG_THAI_TO_STATUS,
  mapVehicles,
} from "../_utils/map-vehicle";
import type { XeFormTarget } from "../_utils/xe-form";
import {
  XE_PAGE_SIZE,
  computePageCount,
  computeXeStats,
  filterVehicles,
  sortVehicles,
} from "../_utils/xe-list";

function apiMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

/*
 * Toàn bộ state + nghiệp vụ của màn Xe (truy vấn, lọc/sắp xếp, phân trang,
 * thống kê, tạo/sửa/xóa). Component `XeBoard` chỉ còn render UI.
 */
export function useXeBoard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching, refetch } =
    useVehicles(companyId);
  const driversQuery = useDrivers(companyId, { status: "ACTIVE", size: 100 });
  const createVehicle = useCreateVehicle(companyId);
  const updateVehicle = useUpdateVehicle(companyId);
  const deleteVehicle = useDeleteVehicle(companyId);

  /* Trường backend chưa lưu (tài xế) — đắp cục bộ theo phiên. */
  const [overrides, setOverrides] = useState<Record<string, Partial<Xe>>>({});
  const [formTarget, setFormTarget] = useState<XeFormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Xe | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const search = useXeFiltersStore((s) => s.search);
  const soCho = useXeFiltersStore((s) => s.soCho);
  const trangThai = useXeFiltersStore((s) => s.trangThai);
  const page = useXeFiltersStore((s) => s.page);
  const sortKey = useXeFiltersStore((s) => s.sortKey);
  const sortDir = useXeFiltersStore((s) => s.sortDir);
  const setPage = useXeFiltersStore((s) => s.setPage);

  const vehicles = useMemo(() => {
    const mapped = mapVehicles(data ?? []);
    return mapped.map((xe) =>
      overrides[xe.id] ? { ...xe, ...overrides[xe.id] } : xe
    );
  }, [data, overrides]);

  /* Tài xế phụ trách lấy từ API /drivers (chỉ đang hoạt động). */
  const driverOptions: XeDriverOption[] = useMemo(
    () =>
      (driversQuery.data?.content ?? []).map((driver) => ({
        value: driver.driverId,
        label: `${driver.fullName} · ${driver.licenseClass}`,
        name: driver.fullName,
      })),
    [driversQuery.data]
  );

  const driverNameById = useMemo(() => {
    const map: Record<string, string> = {};
    driverOptions.forEach((option) => {
      map[option.value] = option.name;
    });
    return map;
  }, [driverOptions]);

  const filtered = useMemo(
    () => filterVehicles(vehicles, { search, soCho, trangThai }),
    [vehicles, search, soCho, trangThai]
  );

  const sorted = useMemo(
    () => sortVehicles(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const pageCount = computePageCount(sorted.length);
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const start = (safePage - 1) * XE_PAGE_SIZE;
  const rows = sorted.slice(start, start + XE_PAGE_SIZE);

  const stats = useMemo(() => computeXeStats(vehicles), [vehicles]);

  const setOverride = useCallback((id: string, patch: Partial<Xe>) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["company-vehicles", companyId] });

  const handleSave = async (values: XeFormValues) => {
    if (!companyId) return;
    const uiPatch: Partial<Xe> = {
      taiXeId: values.taiXeId,
      taiXe: values.taiXeId ? (driverNameById[values.taiXeId] ?? null) : null,
    };
    const status = XE_TRANG_THAI_TO_STATUS[values.trangThai];

    try {
      if (formTarget?.mode === "edit") {
        await updateVehicle.mutateAsync({
          vehicleId: formTarget.xe.id,
          payload: {
            plateNumber: values.bienSo,
            vehicleModel: values.loaiXe,
            passengerCapacity: values.soCho,
            status,
          },
        });
        setOverride(formTarget.xe.id, uiPatch);
        setToast({
          message: `Đã lưu thay đổi cho xe ${values.bienSo}.`,
          type: "success",
        });
      } else {
        const created = await createVehicle.mutateAsync({
          plateNumber: values.bienSo,
          vehicleModel: values.loaiXe,
          passengerCapacity: values.soCho,
        });
        setOverride(created.id, uiPatch);
        if (status !== "ACTIVE") {
          await updateVehicle.mutateAsync({
            vehicleId: created.id,
            payload: { status },
          });
        }
        setPage(1);
        setToast({
          message: `Đã thêm xe ${values.bienSo} vào đội xe.`,
          type: "success",
        });
      }
      await invalidate();
      setFormTarget(null);
    } catch (err) {
      setToast({ message: apiMessage(err), type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      await deleteVehicle.mutateAsync(target.id);
      await invalidate();
      setToast({
        message: `Đã xóa xe ${target.bienSo} khỏi đội xe.`,
        type: "success",
      });
    } catch (err) {
      setToast({ message: apiMessage(err), type: "error" });
    } finally {
      setDeleteTarget(null);
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
    vehicles,
    driverOptions,
    sorted,
    rows,
    stats,
    start,
    pageCount,
    safePage,
    formTarget,
    setFormTarget,
    deleteTarget,
    setDeleteTarget,
    toast,
    setToast,
    handleSave,
    handleDelete,
  };
}
