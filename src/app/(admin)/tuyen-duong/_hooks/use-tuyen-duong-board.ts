"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAreas } from "@/api/area/tanstack/use-areas";
import { useCreateRoute } from "@/api/tuyen-duong/tanstack/use-create-route";
import { useRoutes } from "@/api/tuyen-duong/tanstack/use-routes";
import { useUpdateRoute } from "@/api/tuyen-duong/tanstack/use-update-route";
import { ApiError } from "@/api/types";
import type { RouteStatus } from "@/api/tuyen-duong/api/types";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useTuyenDuongFiltersStore } from "@/global-states/tuyen-duong-filters-store";
import { routeLabel } from "@/utils/route-label";
import type { TuyenDuong, TuyenDuongFormValues } from "../_data/tuyen-duong";
import { mapRoutes } from "../_utils/map-route";
import type { TuyenDuongFormTarget } from "../_utils/tuyen-duong-form";

const PAGE_SIZE = 5;

function apiMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra, vui lòng thử lại.";
}

/*
 * Toàn bộ state + nghiệp vụ của màn Tuyến đường (truy vấn, lọc, phân trang,
 * thêm/sửa/kích hoạt/tạm dừng). Component `TuyenDuongBoard` chỉ còn render UI.
 */
export function useTuyenDuongBoard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching, refetch } =
    useRoutes(companyId);
  const {
    data: areas,
    isLoading: areasLoading,
    isError: areasError,
    error: areasErrorRaw,
    isFetching: areasFetching,
    refetch: refetchAreas,
  } = useAreas();

  const createRoute = useCreateRoute(companyId);
  const updateRoute = useUpdateRoute(companyId);

  const [formTarget, setFormTarget] = useState<TuyenDuongFormTarget | null>(null);
  const [pauseTarget, setPauseTarget] = useState<TuyenDuong | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const areaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (areas ?? []).forEach((area) => {
      map[area.id] = area.name;
    });
    return map;
  }, [areas]);

  const rawRoutes = useMemo(() => data ?? [], [data]);
  /* Số chuyến mỗi tuyến do backend trả sẵn trong RouteResponse.tripCount. */
  const routes = useMemo(() => mapRoutes(rawRoutes), [rawRoutes]);

  const search = useTuyenDuongFiltersStore((s) => s.search);
  const trangThai = useTuyenDuongFiltersStore((s) => s.trangThai);
  const page = useTuyenDuongFiltersStore((s) => s.page);
  const setPage = useTuyenDuongFiltersStore((s) => s.setPage);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return routes.filter((route) => {
      if (trangThai === "active" && !route.active) return false;
      if (trangThai === "paused" && route.active) return false;
      if (!query) return true;
      const haystack = `${route.code} ${route.from} ${route.to}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [routes, search, trangThai]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  /* Hãng chưa có tuyến nào (khác với bộ lọc không khớp tuyến nào). */
  const hasNoRoutes = routes.length === 0;

  const countText = hasNoRoutes
    ? "Chưa có tuyến nào"
    : filtered.length === 0
      ? "Không có tuyến nào khớp bộ lọc"
      : `Tìm thấy ${filtered.length} tuyến · trang ${safePage}/${pageCount}`;

  const invalidateRoutes = () =>
    queryClient.invalidateQueries({ queryKey: ["company-routes", companyId] });

  const handleSetStatus = async (route: TuyenDuong, status: RouteStatus) => {
    try {
      await updateRoute.mutateAsync({
        routeId: route.id,
        payload: { status },
      });
      await invalidateRoutes();
      setToast({
        message:
          status === "ACTIVE"
            ? `Đã kích hoạt lại tuyến ${route.code}.`
            : `Đã ngừng tuyến ${route.code} — tuyến không còn dùng để tạo chuyến mới.`,
        type: status === "ACTIVE" ? "success" : "info",
      });
    } catch (err) {
      setToast({ message: apiMessage(err), type: "error" });
    }
  };

  const handleToggle = (route: TuyenDuong) => {
    if (route.active) {
      setPauseTarget(route);
      return;
    }
    void handleSetStatus(route, "ACTIVE");
  };

  const handleConfirmPause = async () => {
    if (!pauseTarget) return;
    await handleSetStatus(pauseTarget, "INACTIVE");
    setPauseTarget(null);
  };

  const handleFormSave = async (values: TuyenDuongFormValues) => {
    /* Backend yêu cầu `name`; suy ra từ tên điểm đi – điểm đến đang chọn. */
    const name = routeLabel(
      areaNameById[values.originAreaId] ?? "",
      areaNameById[values.destinationAreaId] ?? ""
    );
    const payload = {
      code: values.code,
      name,
      originAreaId: values.originAreaId,
      destinationAreaId: values.destinationAreaId,
      distanceKm: values.km,
      durationMinutes: values.min,
      baseFareAmount: values.price,
    };

    if (formTarget?.mode === "edit") {
      await updateRoute.mutateAsync({
        routeId: formTarget.route.id,
        payload,
      });
      setToast({
        message: `Đã cập nhật tuyến ${values.code}.`,
        type: "success",
      });
    } else {
      await createRoute.mutateAsync(payload);
      setPage(1);
      setToast({
        message: `Đã thêm tuyến ${values.code}.`,
        type: "success",
      });
    }
    await invalidateRoutes();
    setFormTarget(null);
  };

  return {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText: apiMessage(error),
    refetch,
    rawRoutes,
    areas: areas ?? [],
    areasLoading,
    areasError,
    areasErrorText: areasError ? apiMessage(areasErrorRaw) : "",
    areasRetrying: areasFetching,
    refetchAreas,
    hasNoRoutes,
    filtered,
    rows,
    start,
    pageCount,
    safePage,
    countText,
    formTarget,
    setFormTarget,
    pauseTarget,
    setPauseTarget,
    toast,
    setToast,
    updatePending: updateRoute.isPending,
    handleToggle,
    handleConfirmPause,
    handleFormSave,
  };
}
