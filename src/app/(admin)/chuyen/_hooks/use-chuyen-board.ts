"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAssignTrip } from "@/api/chuyen/tanstack/use-assign-trip";
import { useCreateTrip } from "@/api/chuyen/tanstack/use-create-trip";
import { usePublishTrip } from "@/api/chuyen/tanstack/use-publish-trip";
import { useTripAssignments } from "@/api/chuyen/tanstack/use-trip-assignments";
import { useTrips } from "@/api/chuyen/tanstack/use-trips";
import { useUpdateTrip } from "@/api/chuyen/tanstack/use-update-trip";
import type {
  CreateTripPayload,
  UpdateTripPayload,
} from "@/api/chuyen/api/types";
import { useDriverTripStatuses } from "@/api/tai-xe/tanstack/use-driver-trip-statuses";
import { useDrivers } from "@/api/tai-xe/tanstack/use-drivers";
import { useRoutes } from "@/api/tuyen-duong/tanstack/use-routes";
import { useVehicles } from "@/api/xe/tanstack/use-vehicles";
import type { VehicleResponse } from "@/api/xe/api/types";
import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import { routeLabel, routeLabelWithStation } from "@/utils/route-label";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useChuyenFiltersStore } from "@/global-states/chuyen-filters-store";
import {
  SO_DONG_MOI_TRANG,
  TAIXE_FILTER_UNASSIGNED,
  isoSangNhan,
  taoMaChuyen,
  type ChuyenFormTarget,
  type ChuyenLichPrefill,
  type ChuyenRecord,
  type ChuyenTuyenOption,
  type TaiXeOption,
  type XeOption,
} from "../_data/chuyen";
import type { ChuyenFormValues } from "./use-chuyen-form";
import {
  applyTripAssignment,
  buildDepartureAt,
  buildExpectedArrivalAt,
  mapTrips,
} from "../_utils/map-trip";

type FormState = { key: number; target: ChuyenFormTarget };

type SucoState = { key: number; ma: string; step: "nhan" | "ket-qua" };

/*
 * Toàn bộ state + nghiệp vụ của màn Chuyến (truy vấn, lọc/sắp xếp, phân trang,
 * form tạo/sửa, hủy chuyến, sự cố). Component `ChuyenBoard` chỉ còn render UI.
 */
export function useChuyenBoard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);

  const tripsQuery = useTrips(companyId);
  const routesQuery = useRoutes(companyId);
  const vehiclesQuery = useVehicles(companyId);
  const driversQuery = useDrivers(companyId, { status: "ACTIVE", size: 100 });
  const queryClient = useQueryClient();
  const createTrip = useCreateTrip(companyId);
  const updateTrip = useUpdateTrip(companyId);
  const publishTrip = usePublishTrip(companyId);
  const assignTrip = useAssignTrip(companyId);

  const [overrides, setOverrides] = useState<Record<string, Partial<ChuyenRecord>>>(
    {}
  );
  const [detailMa, setDetailMa] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [cancelMa, setCancelMa] = useState<string | null>(null);
  const [sucoState, setSucoState] = useState<SucoState | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const view = useChuyenFiltersStore((s) => s.view);
  const tab = useChuyenFiltersStore((s) => s.tab);
  const filters = useChuyenFiltersStore((s) => s.filters);
  const page = useChuyenFiltersStore((s) => s.page);
  const sortKey = useChuyenFiltersStore((s) => s.sortKey);
  const sortDir = useChuyenFiltersStore((s) => s.sortDir);
  const setPage = useChuyenFiltersStore((s) => s.setPage);
  const resetFilters = useChuyenFiltersStore((s) => s.reset);

  const routes = useMemo(() => routesQuery.data ?? [], [routesQuery.data]);

  const tuyenOptions: ChuyenTuyenOption[] = useMemo(
    () =>
      routes.map((route) => ({
        value: route.id,
        label: `${routeLabel(route.originAreaName, route.destinationAreaName)} · ${route.distanceKm} km · ${route.durationMinutes} phút`,
      })),
    [routes]
  );

  const routeDurations = useMemo(() => {
    const map: Record<string, number> = {};
    routes.forEach((route) => {
      map[route.id] = route.durationMinutes;
    });
    return map;
  }, [routes]);

  /* Danh sách xe đầy đủ dùng để ghép phân công; options chỉ lấy xe đang hoạt động. */
  const xeOptions: XeOption[] = useMemo(
    () =>
      (vehiclesQuery.data ?? [])
        .filter((vehicle) => vehicle.status === "ACTIVE")
        .map((vehicle) => ({
          value: vehicle.id,
          label: `${vehicle.plateNumber} · ${vehicle.passengerCapacity} chỗ · ${vehicle.vehicleModel}`,
          plateNumber: vehicle.plateNumber,
          model: vehicle.vehicleModel,
          capacity: vehicle.passengerCapacity,
        })),
    [vehiclesQuery.data]
  );

  const vehicleById = useMemo(() => {
    const map: Record<string, VehicleResponse> = {};
    (vehiclesQuery.data ?? []).forEach((vehicle) => {
      map[vehicle.id] = vehicle;
    });
    return map;
  }, [vehiclesQuery.data]);

  const taixeOptions: TaiXeOption[] = useMemo(
    () =>
      (driversQuery.data?.content ?? []).map((driver) => ({
        value: driver.driverId,
        label: `${driver.fullName} · ${driver.licenseClass}`,
        name: driver.fullName,
        licenseClass: driver.licenseClass,
      })),
    [driversQuery.data]
  );

  const xeById = useMemo(() => {
    const map: Record<string, XeOption> = {};
    xeOptions.forEach((option) => {
      map[option.value] = option;
    });
    return map;
  }, [xeOptions]);

  const taixeById = useMemo(() => {
    const map: Record<string, TaiXeOption> = {};
    taixeOptions.forEach((option) => {
      map[option.value] = option;
    });
    return map;
  }, [taixeOptions]);

  /*
   * API danh sách chuyến không trả phân công. Ghép thêm 2 nguồn:
   * - /trips/{id}/assignments → xe + tài xế của từng chuyến;
   * - /drivers/{id}/trips → trạng thái nhận lệnh (ASSIGNED/ACCEPTED/…).
   */
  const tripIds = useMemo(
    () => (tripsQuery.data ?? []).map((trip) => trip.id),
    [tripsQuery.data]
  );
  const assignmentByTripId = useTripAssignments(companyId, tripIds);
  const driverIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(assignmentByTripId).forEach((assignment) => {
      if (assignment.driverId) ids.add(assignment.driverId);
    });
    return Array.from(ids);
  }, [assignmentByTripId]);
  const assignmentStatusByTripId = useDriverTripStatuses(companyId, driverIds);

  /* Dữ liệu thật từ API, đắp thêm phân công và các thay đổi cục bộ. */
  const trips = useMemo(() => {
    const mapped = mapTrips(tripsQuery.data ?? []).map((trip) => {
      const assignment = assignmentByTripId[trip.id];
      if (!assignment) return trip;
      return applyTripAssignment(
        trip,
        assignment,
        assignment.vehicleId ? vehicleById[assignment.vehicleId] : undefined,
        assignmentStatusByTripId[trip.id]
      );
    });
    return mapped.map((trip) =>
      overrides[trip.id] ? { ...trip, ...overrides[trip.id] } : trip
    );
  }, [
    tripsQuery.data,
    assignmentByTripId,
    assignmentStatusByTripId,
    vehicleById,
    overrides,
  ]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: trips.length };
    trips.forEach((trip) => {
      result[trip.trangThai] = (result[trip.trangThai] ?? 0) + 1;
    });
    return result;
  }, [trips]);

  const filtered = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return trips.filter((trip) => {
      if (tab !== "all" && trip.trangThai !== tab) return false;
      if (filters.ngay !== "all" && trip.ngayKey !== filters.ngay) return false;
      if (filters.tuyen !== "all" && trip.tuyenId !== filters.tuyen) return false;
      if (filters.taixe !== "all") {
        const khop =
          filters.taixe === TAIXE_FILTER_UNASSIGNED
            ? trip.taixeId === null
            : trip.taixeId === filters.taixe;
        if (!khop) return false;
      }
      if (keyword) {
        const haystack = [
          trip.ma,
          trip.tuyen,
          trip.tuyenPhu,
          trip.taixe ?? "",
          trip.xeBienSo ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [trips, tab, filters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const direction = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "ma":
          return a.ma.localeCompare(b.ma, "vi") * direction;
        case "khoiHanh":
          return `${a.ngayISO}${a.gio}`.localeCompare(`${b.ngayISO}${b.gio}`) *
            direction;
        case "daDat":
          return (a.daDat - b.daDat) * direction;
        case "giaVe":
          return (a.giaVe - b.giaVe) * direction;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / SO_DONG_MOI_TRANG));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice(
    (currentPage - 1) * SO_DONG_MOI_TRANG,
    currentPage * SO_DONG_MOI_TRANG
  );

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const detailTrip = trips.find((trip) => trip.ma === detailMa) ?? null;
  const cancelTrip = trips.find((trip) => trip.ma === cancelMa) ?? null;
  const sucoTrip = trips.find((trip) => trip.ma === sucoState?.ma) ?? null;

  const setOverride = useCallback(
    (tripId: string, patch: Partial<ChuyenRecord>) => {
      setOverrides((prev) => ({ ...prev, [tripId]: { ...prev[tripId], ...patch } }));
    },
    []
  );

  const handleReset = useCallback(() => {
    resetFilters();
    setToast({ message: "Đã xóa bộ lọc", type: "info" });
  }, [resetFilters]);

  const openCreate = useCallback((prefill?: ChuyenLichPrefill) => {
    setFormState((prev) => ({
      key: (prev?.key ?? 0) + 1,
      target: { mode: "create", prefill },
    }));
  }, []);

  const openEdit = useCallback((trip: ChuyenRecord) => {
    setDetailMa(null);
    setFormState((prev) => ({
      key: (prev?.key ?? 0) + 1,
      target: { mode: "edit", trip },
    }));
  }, []);

  const openDetail = useCallback((ma: string) => setDetailMa(ma), []);

  const openCancelFromTable = useCallback((ma: string) => setCancelMa(ma), []);

  const openCancelFromDrawer = useCallback((trip: ChuyenRecord) => {
    setDetailMa(null);
    setCancelMa(trip.ma);
  }, []);

  const openSuco = useCallback(
    (trip: ChuyenRecord, step: "nhan" | "ket-qua") => {
      setSucoState((prev) => ({
        key: (prev?.key ?? 0) + 1,
        ma: trip.ma,
        step,
      }));
    },
    []
  );

  const closeDetail = useCallback(() => setDetailMa(null), []);
  const closeForm = useCallback(() => setFormState(null), []);
  const closeCancel = useCallback(() => setCancelMa(null), []);
  const closeSuco = useCallback(() => setSucoState(null), []);

  /* Đắp các trường backend chưa lưu được (tuyến, tài xế, xe). */
  const applyLocalOverride = useCallback(
    (
      tripId: string,
      values: ChuyenFormValues,
      route: RouteResponse | null,
      trip: ChuyenRecord | null
    ) => {
      const tuyenName = route
        ? routeLabel(route.originAreaName, route.destinationAreaName)
        : (trip?.tuyen ?? "");
      const tuyenPhu = route
        ? routeLabelWithStation(route.originAreaName, route.destinationAreaName)
        : (trip?.tuyenPhu ?? "");
      const xe = values.xe ? (xeById[values.xe] ?? null) : null;
      const taixe = values.taixe ? (taixeById[values.taixe] ?? null) : null;
      const sucChua = xe ? xe.capacity : (trip?.sucChua ?? 0);
      setOverride(tripId, {
        ngayISO: values.ngay,
        ngayKey: isoSangNhan(values.ngay),
        gio: values.gio,
        tuyenId: values.tuyen,
        tuyen: tuyenName || (trip?.tuyen ?? ""),
        tuyenPhu,
        taixeId: values.taixe || null,
        taixe: taixe?.name ?? null,
        xeId: values.xe || null,
        xeBienSo: xe?.plateNumber ?? null,
        xeLoai: xe ? `${xe.model} · ${xe.capacity} chỗ` : null,
        sucChua,
        lenh: values.taixe && values.xe ? (trip?.lenh ?? "chua-nhan") : null,
      });
    },
    [setOverride, xeById, taixeById]
  );

  const handleSaveForm = useCallback(
    (target: ChuyenFormTarget, values: ChuyenFormValues) => {
      const route = routes.find((item) => item.id === values.tuyen) ?? null;
      const durationMinutes = route?.durationMinutes ?? 90;
      const departureAt = buildDepartureAt(values.ngay, values.gio);
      const expectedArrivalAt = buildExpectedArrivalAt(departureAt, durationMinutes);

      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["company-trips", companyId] });
        queryClient.invalidateQueries({
          queryKey: ["company-trip-assignment", companyId],
        });
        queryClient.invalidateQueries({
          queryKey: ["company-driver-trips", companyId],
        });
      };

      const finishOk = (message: string) => {
        setFormState(null);
        setToast({ message, type: "success" });
        void invalidate();
      };

      const assignPayload = { vehicleId: values.xe, driverId: values.taixe };

      if (target.mode === "edit") {
        const payload: UpdateTripPayload = {
          tripCode: target.trip.ma,
          departureAt,
          expectedArrivalAt,
        };
        updateTrip.mutate(
          { tripId: target.trip.id, payload },
          {
            onSuccess: () => {
              assignTrip.mutate(
                { tripId: target.trip.id, payload: assignPayload },
                {
                  onSuccess: () => {
                    applyLocalOverride(target.trip.id, values, route, target.trip);
                    finishOk(`Đã lưu thay đổi chuyến ${target.trip.ma}.`);
                  },
                  onError: (error) => {
                    applyLocalOverride(target.trip.id, values, route, target.trip);
                    setToast({
                      message: `Đã lưu chuyến nhưng chưa phân công được xe/tài xế: ${error.message}`,
                      type: "error",
                    });
                  },
                }
              );
            },
            onError: (error) => {
              setToast({ message: error.message, type: "error" });
            },
          }
        );
        return;
      }

      if (!route) {
        setToast({ message: "Chọn tuyến đang hoạt động trước khi lưu.", type: "error" });
        return;
      }

      const tripCode = taoMaChuyen(trips);
      const payload: CreateTripPayload = {
        routeId: route.id,
        tripCode,
        departureAt,
        expectedArrivalAt,
      };
      createTrip.mutate(payload, {
        onSuccess: (created) => {
          /* Tạo chuyến → phân công xe/tài xế → công bố mở bán (đúng luồng UI hiện tại). */
          assignTrip.mutate(
            { tripId: created.id, payload: assignPayload },
            {
              onSuccess: () => {
                applyLocalOverride(created.id, values, route, null);
                publishTrip.mutate(created.id, {
                  onSuccess: () =>
                    finishOk(
                      `Đã tạo chuyến mới ${created.tripCode} và công bố bán vé.`
                    ),
                  onError: (error) =>
                    finishOk(
                      `Đã tạo chuyến ${created.tripCode} nhưng chưa công bố được: ${error.message}`
                    ),
                });
              },
              onError: (error) => {
                applyLocalOverride(created.id, values, route, null);
                finishOk(
                  `Đã tạo chuyến ${created.tripCode} nhưng chưa phân công được xe/tài xế: ${error.message}`
                );
              },
            }
          );
        },
        onError: (error) => {
          setToast({ message: error.message, type: "error" });
        },
      });
    },
    [
      routes,
      trips,
      companyId,
      queryClient,
      createTrip,
      updateTrip,
      publishTrip,
      assignTrip,
      applyLocalOverride,
    ]
  );

  /* Hủy chuyến: backend chưa có endpoint → giữ cục bộ, không persist. */
  const handleConfirmCancel = useCallback(
    (ma: string) => {
      const trip = trips.find((item) => item.ma === ma);
      if (trip) {
        setOverride(trip.id, {
          trangThai: "da-huy",
          ghiChu: "Đã hủy trước khởi hành",
        });
      }
      setCancelMa(null);
      setToast({
        message: `Đã hủy chuyến ${ma} (lưu tạm ở màn — backend chưa hỗ trợ hủy)`,
        type: "success",
      });
    },
    [trips, setOverride]
  );

  /* Sự cố: backend chưa có endpoint → giữ cục bộ, không persist. */
  const handleSucoNhan = useCallback(
    (ma: string, data: { nguoi: string; bienPhap: string }) => {
      const trip = trips.find((item) => item.ma === ma);
      if (trip?.suco) {
        setOverride(trip.id, {
          suco: {
            ...trip.suco,
            trangThai: "dang-xu-ly",
            nguoiXuLy: data.nguoi,
            bienPhap: data.bienPhap,
          },
        });
      }
      setSucoState(null);
      setToast({
        message: `Đã nhận xử lý sự cố ${ma} (lưu tạm — backend chưa hỗ trợ)`,
        type: "success",
      });
    },
    [trips, setOverride]
  );

  const handleSucoKetQua = useCallback(
    (ma: string, data: { bienPhapThuc: string; ketQua: string }) => {
      const trip = trips.find((item) => item.ma === ma);
      if (trip?.suco) {
        setOverride(trip.id, {
          suco: {
            ...trip.suco,
            trangThai: "da-xu-ly",
            bienPhapThuc: data.bienPhapThuc,
            ketQua: data.ketQua,
            dongLuc: new Date().toTimeString().slice(0, 5),
          },
        });
      }
      setSucoState(null);
      setToast({
        message: `Đã ghi nhận kết quả và đóng sự cố ${ma} (lưu tạm — backend chưa hỗ trợ)`,
        type: "success",
      });
    },
    [trips, setOverride]
  );

  /* Công bố chuyến nháp (chuyển SCHEDULED, bật mở bán). */
  const handlePublish = useCallback(
    (tripId: string) => {
      publishTrip.mutate(tripId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["company-trips", companyId] });
          queryClient.invalidateQueries({
            queryKey: ["company-trip-assignment", companyId],
          });
          queryClient.invalidateQueries({
            queryKey: ["company-driver-trips", companyId],
          });
          setToast({ message: "Chuyến đã được công bố và mở bán vé.", type: "success" });
        },
        onError: (error) => {
          setToast({
            message: `Không thể công bố chuyến: ${error.message}`,
            type: "error",
          });
        },
      });
    },
    [publishTrip, companyId, queryClient, setToast]
  );

  return {
    companyId,
    companyHydrated,
    view,
    isLoading: tripsQuery.isLoading,
    isError: tripsQuery.isError,
    errorText: tripsQuery.error?.message ?? "Đã xảy ra lỗi khi tải dữ liệu.",
    refetch: tripsQuery.refetch,
    trips,
    counts,
    tuyenOptions,
    taixeOptions,
    xeOptions,
    routeDurations,
    sorted,
    pageRows,
    currentPage,
    pageCount,
    detailTrip,
    cancelTrip,
    sucoTrip,
    sucoState,
    formState,
    toast,
    setToast,
    handleReset,
    openCreate,
    openEdit,
    openDetail,
    openCancelFromTable,
    openCancelFromDrawer,
    openSuco,
    closeDetail,
    closeForm,
    closeCancel,
    closeSuco,
    handleSaveForm,
    handleConfirmCancel,
    handleSucoNhan,
    handleSucoKetQua,
    handlePublish,
  };
}
