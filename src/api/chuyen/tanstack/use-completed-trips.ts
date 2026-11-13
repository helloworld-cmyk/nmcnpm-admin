"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listCompletedTripsAPI } from "../api/list-completed-trips";
import type { TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCompletedTripsOptions = Omit<
  UseQueryOptions<TripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách chuyến COMPLETED của hãng; chỉ gọi khi có companyId. */
export function useCompletedTrips(
  companyId: string,
  options?: UseCompletedTripsOptions
) {
  return useQuery<TripResponse[], ApiError>({
    queryKey: ["company-trips-completed", companyId],
    queryFn: () => listCompletedTripsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}
