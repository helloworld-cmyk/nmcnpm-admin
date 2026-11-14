"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAssignTrip } from "@/api/chuyen/tanstack/use-assign-trip";
import { useCancelTrip } from "@/api/chuyen/tanstack/use-cancel-trip";
import { useCreateTrip } from "@/api/chuyen/tanstack/use-create-trip";
import { useDeleteTrip } from "@/api/chuyen/tanstack/use-delete-trip";
import { usePublishTrip } from "@/api/chuyen/tanstack/use-publish-trip";
import { useTripAssignments } from "@/api/chuyen/tanstack/use-trip-assignments";
import { useTripBookingCounts } from "@/api/chuyen/tanstack/use-trip-booking-counts";
import { useTrips } from "@/api/chuyen/tanstack/use-trips";
import { useUpdateTrip } from "@/api/chuyen/tanstack/use-update-trip";
import type {
  CancelTripPayload,
  CreateTripPayload,
  TripResponse,
  UpdateTripPayload,
} from "@/api/chuyen/api/types";
import { useDriverTripStatuses } from "@/api/tai-xe/tanstack/use-driver-trip-statuses";
import { useDrivers } from "@/api/tai-xe/tanstack/use-drivers";
import { useRoutes } from "@/api/tuyen-duong/tanstack/use-routes";
import { useVehicles } from "@/api/xe/tanstack/use-vehicles";
import type { VehicleResponse } from "@/api/xe/api/types";
import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import { routeLabel } from "@/utils/route-label";
import type { ToastData } from "@/components/ui/toast";
import { useCompanyStore } from "@/global-states/company-store";
import { useChuyenFiltersStore } from "@/global-states/chuyen-filters-store";
import {
  SO_DONG_MOI_TRANG,
  TAIXE_FILTER_UNASSIGNED,
  coTheCongBo,
  coTheSua,
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
import { useChuyenTabTrips } from "./use-chuyen-tab-trips";

type FormState = { key: number; target: ChuyenFormTarget };

type SucoState = { key: number; tripId: string; step: "nhan" | "ket-qua" };

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
  const cancelTripMutation = useCancelTrip(companyId);
  const deleteTripMutation = useDeleteTrip(companyId);

  const [overrides, setOverrides] = useState<Record<string, Partial<ChuyenRecord>>>(
    {}
  );
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
        label: driver.licenseClass
          ? `${driver.fullName} · ${driver.licenseClass}`
          : driver.fullName,
        name: driver.fullName,
        licenseClass: driver.licenseClass ?? "",
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

  /*
   * API danh sách chuyến không trả số ghế đã đặt. Chỉ chuyến đã công bố mới có
   * đặt vé (nháp chưa mở bán, chuyến hủy/kết thúc thúc thì vé đều đã hủy) nên
   * chỉ tải danh sách đặt vé cho các chuyến còn có thể phát sinh đặt chỗ.
   */
  const bookingCountTripIds = useMemo(
    () =>
      (tripsQuery.data ?? [])
        .filter(
          (trip) =>
            trip.status === "SCHEDULED" ||
            trip.status === "IN_PROGRESS" ||
            trip.status === "COMPLETED"
        )
        .map((trip) => trip.id),
    [tripsQuery.data]
  );
  const bookedSeatsByTripId = useTripBookingCounts(
    companyId,
    bookingCountTripIds
  );

  /* Dữ liệu thật từ API, đắp thêm phân công, số ghế đã đặt và thay đổi cục bộ. */
  const decorate = useCallback(
    (raw: TripResponse[]) => {
      const mapped = mapTrips(raw).map((trip) => {
        const assignment = assignmentByTripId[trip.id];
        const withAssignment = assignment
          ? applyTripAssignment(
              trip,
              assignment,
              assignment.vehicleId
                ? vehicleById[assignment.vehicleId]
                : undefined,
              assignmentStatusByTripId[trip.id]
            )
          : trip;
        return { ...withAssignment, daDat: bookedSeatsByTripId[trip.id] ?? 0 };
      });
      return mapped.map((trip) =>
        overrides[trip.id] ? { ...trip, ...overrides[trip.id] } : trip
      );
    },
    [
      assignmentByTripId,
      assignmentStatusByTripId,
      bookedSeatsByTripId,
      vehicleById,
      overrides,
    ]
  );

  /* Toàn bộ chuyến (gồm nháp) — nguồn cho thống kê tab, lịch và form. */
  const trips = useMemo(
    () => decorate(tripsQuery.data ?? []),
    [decorate, tripsQuery.data]
  );

  /*
   * Chuyến hiển thị trên bảng theo tab trạng thái: tab cụ thể lấy từ endpoint
   * list riêng; tab "all" dùng danh sách đầy đủ. Tab "sap-toi" gộp thêm chuyến
   * nháp vì endpoint /upcoming chỉ trả SCHEDULED, còn nháp cũng thuộc nhóm này.
   */
  const tabSource = useChuyenTabTrips(companyId, tab);
  const tabTrips = useMemo(() => {
    if (tabSource.raw === null) return trips;
    const drafts =
      tab === "sap-toi"
        ? (tripsQuery.data ?? []).filter((trip) => trip.status === "DRAFT")
        : [];
    /*
     * Endpoint /upcoming có thể đã trả cả chuyến nháp, cộng thêm danh sách nháp
     * ghép tay sẽ sinh dòng trùng (cùng id/mã) → gộp theo id trước khi hiển thị.
     */
    const byId = new Map<string, TripResponse>();
    [...tabSource.raw, ...drafts].forEach((trip) => {
      byId.set(trip.id, trip);
    });
    return decorate(Array.from(byId.values()));
  }, [tabSource.raw, tab, trips, tripsQuery.data, decorate]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: trips.length };
    trips.forEach((trip) => {
      result[trip.trangThai] = (result[trip.trangThai] ?? 0) + 1;
    });
    return result;
  }, [trips]);

  const filtered = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return tabTrips.filter((trip) => {
      if (filters.ngay && trip.ngayISO !== filters.ngay) return false;
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
          trip.taixe ?? "",
          trip.xeBienSo ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [tabTrips, filters]);

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

  const detailTrip = trips.find((trip) => trip.id === detailId) ?? null;
  const cancelTrip = trips.find((trip) => trip.id === cancelId) ?? null;
  const deleteTrip = trips.find((trip) => trip.id === deleteId) ?? null;
  const sucoTrip = trips.find((trip) => trip.id === sucoState?.tripId) ?? null;

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
    setDetailId(null);
    setFormState((prev) => ({
      key: (prev?.key ?? 0) + 1,
      target: { mode: "edit", trip },
    }));
  }, []);

  const openDetail = useCallback((tripId: string) => setDetailId(tripId), []);

  const openCancelFromTable = useCallback(
    (tripId: string) => setCancelId(tripId),
    []
  );

  const openCancelFromDrawer = useCallback((trip: ChuyenRecord) => {
    setDetailId(null);
    setCancelId(trip.id);
  }, []);

  const openDeleteFromTable = useCallback(
    (tripId: string) => setDeleteId(tripId),
    []
  );

  const openDeleteFromDrawer = useCallback((trip: ChuyenRecord) => {
    setDetailId(null);
    setDeleteId(trip.id);
  }, []);

  const openSuco = useCallback(
    (trip: ChuyenRecord, step: "nhan" | "ket-qua") => {
      setSucoState((prev) => ({
        key: (prev?.key ?? 0) + 1,
        tripId: trip.id,
        step,
      }));
    },
    []
  );

  const closeDetail = useCallback(() => setDetailId(null), []);
  const closeForm = useCallback(() => setFormState(null), []);
  const closeCancel = useCallback(() => setCancelId(null), []);
  const closeDelete = useCallback(() => setDeleteId(null), []);
  const closeSuco = useCallback(() => setSucoState(null), []);

  /*
   * Đắp phần lịch chạy mà backend đã lưu (ngày/giờ/tuyến) vào danh sách.
   * Xe + tài xế CHỈ được đắp khi API phân công thành công — nếu backend từ chối
   * (trùng lịch, xe/tài xế không hợp lệ…) mà vẫn đắp cục bộ thì bảng hiển thị
   * sai cho tới lần refresh kế tiếp.
   */
  const applyLocalOverride = useCallback(
    (
      tripId: string,
      values: ChuyenFormValues,
      route: RouteResponse | null,
      trip: ChuyenRecord | null,
      assignmentSaved: boolean
    ) => {
      const tuyenName = route
        ? routeLabel(route.originAreaName, route.destinationAreaName)
        : (trip?.tuyen ?? "");
      const patch: Partial<ChuyenRecord> = {
        ngayISO: values.ngay,
        gio: values.gio,
        tuyenId: values.tuyen,
        tuyen: tuyenName || (trip?.tuyen ?? ""),
      };

      if (assignmentSaved) {
        const xe = values.xe ? (xeById[values.xe] ?? null) : null;
        const taixe = values.taixe ? (taixeById[values.taixe] ?? null) : null;
        patch.taixeId = values.taixe || null;
        patch.taixe = taixe?.name ?? null;
        patch.xeId = values.xe || null;
        patch.xeBienSo = xe?.plateNumber ?? null;
        patch.xeLoai = xe ? `${xe.model} · ${xe.capacity} chỗ` : null;
        patch.sucChua = xe ? xe.capacity : (trip?.sucChua ?? 0);
        patch.lenh = values.taixe && values.xe ? (trip?.lenh ?? "chua-nhan") : null;
      } else if (trip) {
        /* Phân công thất bại: giữ nguyên xe/tài xế đang có trên server. */
        patch.taixeId = trip.taixeId;
        patch.taixe = trip.taixe;
        patch.xeId = trip.xeId;
        patch.xeBienSo = trip.xeBienSo;
        patch.xeLoai = trip.xeLoai;
        patch.sucChua = trip.sucChua;
        patch.lenh = trip.lenh;
      }

      setOverride(tripId, patch);
    },
    [setOverride, xeById, taixeById]
  );

  /* Làm mới cả danh sách đầy đủ lẫn các danh sách theo tab trạng thái. */
  const invalidateTrips = useCallback(() => {
    const keys = [
      "company-trips",
      "company-trips-upcoming",
      "company-trips-in-progress",
      "company-trips-completed",
      "company-trips-cancelled",
    ];
    keys.forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: [key, companyId] });
    });
  }, [queryClient, companyId]);

  const handleSaveForm = useCallback(
    (target: ChuyenFormTarget, values: ChuyenFormValues, publish: boolean) => {
      const route = routes.find((item) => item.id === values.tuyen) ?? null;
      const durationMinutes = route?.durationMinutes ?? 90;
      const departureAt = buildDepartureAt(values.ngay, values.gio);
      const expectedArrivalAt = buildExpectedArrivalAt(departureAt, durationMinutes);

      const invalidate = () => {
        invalidateTrips();
        queryClient.invalidateQueries({
          queryKey: ["company-trip-assignment", companyId],
        });
        queryClient.invalidateQueries({
          queryKey: ["company-driver-trips", companyId],
        });
      };

      const finishOk = (message: string, type: ToastData["type"] = "success") => {
        setFormState(null);
        setToast({ message, type });
        void invalidate();
      };

      const assignPayload = { vehicleId: values.xe, driverId: values.taixe };

      if (target.mode === "edit") {
        /*
         * Backend chỉ cho PATCH lịch chuyến khi chuyến còn nháp (DRAFT + CLOSED).
         * Chuyến đã công bố vẫn được đổi xe/tài xế (assign), nên bỏ qua bước
         * cập nhật lịch để tránh 409 "Only draft trips can be updated".
         */
        const editable = coTheSua(target.trip);

        const assignAndFinish = () => {
          assignTrip.mutate(
            { tripId: target.trip.id, payload: assignPayload },
            {
              onSuccess: () => {
                applyLocalOverride(
                  target.trip.id,
                  values,
                  route,
                  target.trip,
                  true
                );
                if (!editable) {
                  finishOk(`Đã cập nhật xe và tài xế cho chuyến ${target.trip.ma}.`);
                  return;
                }
                if (!publish || !coTheCongBo(target.trip)) {
                  finishOk(`Đã lưu thay đổi chuyến ${target.trip.ma}.`);
                  return;
                }
                publishTrip.mutate(target.trip.id, {
                  onSuccess: () =>
                    finishOk(
                      `Đã lưu và công bố chuyến ${target.trip.ma}, mở bán vé.`
                    ),
                  onError: (error) =>
                    finishOk(
                      `Đã lưu chuyến ${target.trip.ma} nhưng chưa công bố được: ${error.message}`,
                      "error"
                    ),
                });
              },
              onError: (error) => {
                applyLocalOverride(
                  target.trip.id,
                  values,
                  route,
                  target.trip,
                  false
                );
                setToast({
                  message: `Chưa cập nhật được xe/tài xế cho chuyến ${target.trip.ma}: ${error.message}`,
                  type: "error",
                });
              },
            }
          );
        };

        if (!editable) {
          assignAndFinish();
          return;
        }

        const payload: UpdateTripPayload = {
          tripCode: target.trip.ma,
          departureAt,
          expectedArrivalAt,
        };
        updateTrip.mutate(
          { tripId: target.trip.id, payload },
          {
            onSuccess: assignAndFinish,
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
          /* Tạo chuyến nháp → phân công xe/tài xế. Công bố mở bán là thao tác riêng. */
          assignTrip.mutate(
            { tripId: created.id, payload: assignPayload },
            {
              onSuccess: () => {
                applyLocalOverride(created.id, values, route, null, true);
                if (!publish) {
                  finishOk(
                    `Đã tạo chuyến nháp ${created.tripCode}. Bấm "Công bố" để mở bán vé.`
                  );
                  return;
                }
                publishTrip.mutate(created.id, {
                  onSuccess: () =>
                    finishOk(
                      `Đã tạo chuyến ${created.tripCode} và công bố mở bán vé.`
                    ),
                  onError: (error) =>
                    finishOk(
                      `Đã tạo chuyến nháp ${created.tripCode} nhưng chưa công bố được: ${error.message}`,
                      "error"
                    ),
                });
              },
              onError: (error) => {
                /*
                 * Phân công thất bại: KHÔNG đắp xe/tài xế vào danh sách vì server
                 * chưa lưu. Chuyến vẫn được tạo nên chỉ cập nhật lịch chạy.
                 */
                applyLocalOverride(created.id, values, route, null, false);
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
      invalidateTrips,
    ]
  );

  /* Hủy chuyến chưa bắt đầu: đóng bán vé và hủy đặt chỗ/vé còn hiệu lực ở backend. */
  const handleConfirmCancel = useCallback(
    (payload: CancelTripPayload) => {
      if (!cancelTrip) return;
      cancelTripMutation.mutate(
        { tripId: cancelTrip.id, payload },
        {
          onSuccess: () => {
            invalidateTrips();
            queryClient.invalidateQueries({
              queryKey: ["company-trip-bookings", companyId, cancelTrip.id],
            });
            setCancelId(null);
            setToast({
              message: `Đã hủy chuyến ${cancelTrip.ma}. Vé liên quan đã chuyển sang Đã hủy.`,
              type: "success",
            });
          },
          onError: (error) => {
            setToast({
              message: `Không thể hủy chuyến: ${error.message}`,
              type: "error",
            });
          },
        }
      );
    },
    [cancelTrip, cancelTripMutation, companyId, queryClient, invalidateTrips]
  );

  /* Xóa chuyến nháp (chưa công bố, chưa có đặt vé) khỏi danh sách. */
  const handleConfirmDelete = useCallback(
    (tripId: string) => {
      const temp = trips.find((item) => item.id === tripId);
      deleteTripMutation.mutate(tripId, {
        onSuccess: () => {
          invalidateTrips();
          queryClient.invalidateQueries({
            queryKey: ["company-trip-assignment", companyId],
          });
          setDeleteId(null);
          setToast({
            message: `Đã xóa chuyến nháp ${temp?.ma ?? ""}.`,
            type: "success",
          });
        },
        onError: (error) => {
          setToast({
            message: `Không thể xóa chuyến: ${error.message}`,
            type: "error",
          });
        },
      });
    },
    [trips, deleteTripMutation, companyId, queryClient, invalidateTrips]
  );

  /* Sự cố: backend chưa có endpoint → giữ cục bộ, không persist. */
  const handleSucoNhan = useCallback(
    (tripId: string, data: { nguoi: string; bienPhap: string }) => {
      const trip = trips.find((item) => item.id === tripId);
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
        message: `Đã nhận xử lý sự cố ${trip?.ma ?? ""} (lưu tạm — backend chưa hỗ trợ)`,
        type: "success",
      });
    },
    [trips, setOverride]
  );

  const handleSucoKetQua = useCallback(
    (tripId: string, data: { bienPhapThuc: string; ketQua: string }) => {
      const trip = trips.find((item) => item.id === tripId);
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
        message: `Đã ghi nhận kết quả và đóng sự cố ${trip?.ma ?? ""} (lưu tạm — backend chưa hỗ trợ)`,
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
          invalidateTrips();
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
    [publishTrip, companyId, queryClient, setToast, invalidateTrips]
  );

  return {
    companyId,
    companyHydrated,
    view,
    isLoading: tripsQuery.isLoading || tabSource.isLoading,
    isError: tripsQuery.isError || tabSource.isError,
    errorText:
      (tripsQuery.error ?? tabSource.error)?.message ??
      "Đã xảy ra lỗi khi tải dữ liệu.",
    refetch: () => {
      void tripsQuery.refetch();
      tabSource.refetch();
    },
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
    deleteTrip,
    cancelPending: cancelTripMutation.isPending,
    deletePending: deleteTripMutation.isPending,
    /* Chặn gửi trùng khi form tạo/sửa đang gọi API (tạo → phân công → công bố). */
    formPending:
      createTrip.isPending ||
      updateTrip.isPending ||
      publishTrip.isPending ||
      assignTrip.isPending,
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
    openDeleteFromTable,
    openDeleteFromDrawer,
    openSuco,
    closeDetail,
    closeForm,
    closeCancel,
    closeDelete,
    closeSuco,
    handleSaveForm,
    handleConfirmCancel,
    handleConfirmDelete,
    handleSucoNhan,
    handleSucoKetQua,
    handlePublish,
  };
}
