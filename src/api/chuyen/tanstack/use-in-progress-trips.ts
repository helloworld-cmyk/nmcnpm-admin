"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listInProgressTripsAPI } from "../api/list-in-progress-trips";
import type { TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseInProgressTripsOptions = Omit<
  UseQueryOptions<TripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách chuyến IN_PROGRESS của hãng; chỉ gọi khi có companyId. */
export function useInProgressTrips(
  companyId: string,
  options?: UseInProgressTripsOptions
) {
  return useQuery<TripResponse[], ApiError>({
    queryKey: ["company-trips-in-progress", companyId],
    queryFn: () => listInProgressTripsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}
