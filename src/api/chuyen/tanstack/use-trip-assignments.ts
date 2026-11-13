"use client";

import { useQueries } from "@tanstack/react-query";

import { getTripAssignmentAPI } from "../api/get-trip-assignment";
import type { TripAssignmentResponse } from "../api/types";

/*
 * Query phân công xe + tài xế của nhiều chuyến song song.
 * Trả về map tripId → phân công để hook màn chuyến ghép vào danh sách.
 */
export function useTripAssignments(companyId: string, tripIds: string[]) {
  return useQueries({
    queries: tripIds.map((tripId) => ({
      queryKey: ["company-trip-assignment", companyId, tripId],
      queryFn: () => getTripAssignmentAPI(companyId, tripId),
      enabled: companyId.length > 0 && tripId.length > 0,
    })),
    combine: (results) => {
      const byTripId: Record<string, TripAssignmentResponse> = {};
      results.forEach((result, index) => {
        if (result.data) byTripId[tripIds[index]] = result.data;
      });
      return byTripId;
    },
  });
}
