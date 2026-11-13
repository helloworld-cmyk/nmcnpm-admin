"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTripAssignmentAPI } from "../api/get-trip-assignment";
import type { TripAssignmentResponse } from "../api/types";
import { ApiError } from "../../types";

type UseTripAssignmentOptions = Omit<
  UseQueryOptions<TripAssignmentResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query phân công xe và tài xế hiện tại của chuyến; chỉ gọi khi có đủ id. */
export function useTripAssignment(
  companyId: string,
  tripId: string,
  options?: UseTripAssignmentOptions
) {
  return useQuery<TripAssignmentResponse, ApiError>({
    queryKey: ["company-trip-assignment", companyId, tripId],
    queryFn: () => getTripAssignmentAPI(companyId, tripId),
    enabled: companyId.length > 0 && tripId.length > 0,
    ...options,
  });
}
