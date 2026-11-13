"use client";

import { useQueries } from "@tanstack/react-query";

import { listDriverTripsAPI } from "../api/list-driver-trips";
import type { DriverAssignmentStatus } from "../api/types";

/*
 * Ghép trạng thái phân công (ASSIGNED/ACCEPTED/…) của các tài xế đang được
 * phân công, trả về map tripId → trạng thái để màn chuyến hiển thị đúng "lệnh".
 * Mỗi tài xế chỉ gọi một request danh sách chuyến (tối đa 100 chuyến gần nhất).
 */
export function useDriverTripStatuses(companyId: string, driverIds: string[]) {
  return useQueries({
    queries: driverIds.map((driverId) => ({
      queryKey: ["company-driver-trips", companyId, driverId, 0, 100],
      queryFn: () => listDriverTripsAPI(companyId, driverId, 0, 100),
      enabled: companyId.length > 0 && driverId.length > 0,
    })),
    combine: (results) => {
      const byTripId: Record<string, DriverAssignmentStatus> = {};
      results.forEach((result) => {
        result.data?.content.forEach((trip) => {
          byTripId[trip.tripId] = trip.assignmentStatus;
        });
      });
      return byTripId;
    },
  });
}
