"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";

import { useCreateVehicle } from "@/api/xe/tanstack/use-create-vehicle";
import { useDeleteVehicle } from "@/api/xe/tanstack/use-delete-vehicle";
import { useUpdateVehicle } from "@/api/xe/tanstack/use-update-vehicle";
import { useVehicles } from "@/api/xe/tanstack/use-vehicles";
import type { VehicleStatus } from "@/api/xe/api/types";
import { ApiError } from "@/api/types";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";
import type { Xe, XeFormValues, XeTrangThai } from "../_data/vehicles";
import type { XeSeatTarget } from "../_data/seats";
import type { XeDocumentTarget } from "../_data/documents";
import {
  XE_TRANG_THAI_TO_STATUS,
  mapVehicles,
} from "../_utils/map-vehicle";
import type { XeFormTarget } from "../_utils/xe-form";
import {
  XE_PAGE_SIZE,
  collectSoChoOptions,
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

  const search = useXeFiltersStore((s) => s.search);
  const soCho = useXeFiltersStore((s) => s.soCho);
  const trangThai = useXeFiltersStore((s) => s.trangThai);
  const page = useXeFiltersStore((s) => s.page);
  const sortKey = useXeFiltersStore((s) => s.sortKey);
  const sortDir = useXeFiltersStore((s) => s.sortDir);
  const setPage = useXeFiltersStore((s) => s.setPage);

  /*
   * Backend chỉ hỗ trợ `q` + `status` (không phân trang): tìm kiếm và trạng thái
   * lọc phía server, sau đó vẫn sắp xếp/phân trang trên mảng trả về.
   */
  const deferredSearch = useDeferredValue(search);
  const q = deferredSearch.trim() || undefined;
  const status: VehicleStatus | undefined =
    trangThai && trangThai in XE_TRANG_THAI_TO_STATUS
      ? XE_TRANG_THAI_TO_STATUS[trangThai as XeTrangThai]
      : undefined;

  const { data, isLoading, isError, error, isFetching, refetch } = useVehicles(
    companyId,
    { q, status },
    /* Giữ dữ liệu cũ khi đổi bộ lọc → bảng không nhấp nháy. */
    { placeholderData: keepPreviousData }
  );
  /*
   * Truy vấn không lọc dùng cho thẻ thống kê, danh sách sức chứa và kiểm tra
   * trùng biển số ở form — những chỗ cần toàn bộ đội xe chứ không phải tập
   * đang lọc. React-query cache riêng nên chỉ gọi một lần cho mỗi hãng.
   */
  const fleetQuery = useVehicles(companyId);
  const createVehicle = useCreateVehicle(companyId);
  const updateVehicle = useUpdateVehicle(companyId);
  const deleteVehicle = useDeleteVehicle(companyId);

  const [formTarget, setFormTarget] = useState<XeFormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Xe | null>(null);
  const [seatTarget, setSeatTarget] = useState<XeSeatTarget | null>(null);
  const [docTarget, setDocTarget] = useState<XeDocumentTarget | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const vehicles = useMemo(() => mapVehicles(data ?? []), [data]);
  const fleet = useMemo(
    () => mapVehicles(fleetQuery.data ?? []),
    [fleetQuery.data]
  );

  const filtered = useMemo(
    () => filterVehicles(vehicles, { soCho }),
    [vehicles, soCho]
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

  const stats = useMemo(() => computeXeStats(fleet), [fleet]);

  const soChoOptions = useMemo(
    () => collectSoChoOptions(fleet, soCho),
    [fleet, soCho]
  );

  /*
   * Phân biệt "hãng chưa có xe nào" với "không khớp bộ lọc" dựa trên toàn bộ
   * đội xe (truy vấn không lọc) chứ không phải tập đang lọc.
   */
  const hasNoVehicles = fleetQuery.isSuccess && fleet.length === 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["company-vehicles", companyId] });

  const handleSave = async (values: XeFormValues) => {
    if (!companyId) return;
    const nextStatus = XE_TRANG_THAI_TO_STATUS[values.trangThai];

    try {
      if (formTarget?.mode === "edit") {
        await updateVehicle.mutateAsync({
          vehicleId: formTarget.xe.id,
          payload: {
            plateNumber: values.bienSo,
            vehicleModel: values.loaiXe,
            passengerCapacity: values.soCho,
            status: nextStatus,
          },
        });
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
        if (nextStatus !== "ACTIVE") {
          await updateVehicle.mutateAsync({
            vehicleId: created.id,
            payload: { status: nextStatus },
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
        message: `Đã xử lý xe ${target.bienSo}: xóa khỏi đội xe, hoặc chuyển “Ngưng sử dụng” nếu xe đã có phân công chuyến.`,
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
    fleet,
    sorted,
    rows,
    stats,
    soChoOptions,
    hasNoVehicles,
    start,
    pageCount,
    safePage,
    formTarget,
    setFormTarget,
    deleteTarget,
    setDeleteTarget,
    seatTarget,
    setSeatTarget,
    docTarget,
    setDocTarget,
    toast,
    setToast,
    handleSave,
    handleDelete,
  };
}
