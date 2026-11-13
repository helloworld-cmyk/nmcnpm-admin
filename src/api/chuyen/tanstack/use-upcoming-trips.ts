"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listUpcomingTripsAPI } from "../api/list-upcoming-trips";
import type { TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseUpcomingTripsOptions = Omit<
  UseQueryOptions<TripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách chuyến SCHEDULED của hãng; chỉ gọi khi có companyId. */
export function useUpcomingTrips(
  companyId: string,
  options?: UseUpcomingTripsOptions
) {
  return useQuery<TripResponse[], ApiError>({
    queryKey: ["company-trips-upcoming", companyId],
    queryFn: () => listUpcomingTripsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}
