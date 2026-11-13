"use client";

import { useMemo } from "react";

import { useTripAssignment } from "@/api/chuyen/tanstack/use-trip-assignment";
import { useTripBookings } from "@/api/chuyen/tanstack/use-trip-bookings";
import { useVehicle } from "@/api/xe/tanstack/use-vehicle";
import { ApiError } from "@/api/types";
import { useCompanyStore } from "@/global-states/company-store";

import type { ChuyenRecord, VeItem } from "../_data/chuyen";
import { mapTripAssignment, mapTripBookings } from "../_utils/map-trip";

/*
 * Dữ liệu chi tiết một chuyến cho ngăn kéo: danh sách đặt vé + hành khách, phân
 * công xe/tài xế hiện tại và sức chứa xe. Chỉ gọi API khi có chuyến đang mở.
 */
export function useChuyenDetail(trip: ChuyenRecord | null) {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const tripId = trip?.id ?? "";

  const bookingsQuery = useTripBookings(companyId, tripId);
  const assignmentQuery = useTripAssignment(companyId, tripId);

  const assignment = useMemo(
    () => mapTripAssignment(assignmentQuery.data),
    [assignmentQuery.data]
  );

  const vehicleQuery = useVehicle(companyId, assignment?.vehicleId ?? "");

  const veList = useMemo<VeItem[]>(
    () => mapTripBookings(bookingsQuery.data ?? []),
    [bookingsQuery.data]
  );

  return {
    veList,
    assignment,
    vehicle: vehicleQuery.data ?? null,
    isLoading: bookingsQuery.isLoading,
    isError: bookingsQuery.isError,
    errorText:
      bookingsQuery.error instanceof ApiError
        ? bookingsQuery.error.message
        : "Không tải được danh sách vé.",
    refetch: bookingsQuery.refetch,
  };
}
