"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTripAPI } from "../api/get-trip";
import type { TripDetailResponse } from "../api/types";
import { ApiError } from "../../types";

type UseTripOptions = Omit<
  UseQueryOptions<TripDetailResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chi tiết chuyến theo id; chỉ gọi khi có đủ companyId và tripId. */
export function useTrip(
  companyId: string,
  tripId: string,
  options?: UseTripOptions
) {
  return useQuery<TripDetailResponse, ApiError>({
    queryKey: ["company-trip", companyId, tripId],
    queryFn: () => getTripAPI(companyId, tripId),
    enabled: companyId.length > 0 && tripId.length > 0,
    ...options,
  });
}