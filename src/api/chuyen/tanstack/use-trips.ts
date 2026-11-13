"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listTripsAPI } from "../api/list-trips";
import type { ListTripsQuery, TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseTripsOptions = Omit<
  UseQueryOptions<TripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách chuyến của hãng theo bộ lọc; chỉ gọi khi có companyId. */
export function useTrips(
  companyId: string,
  query?: ListTripsQuery,
  options?: UseTripsOptions
) {
  return useQuery<TripResponse[], ApiError>({
    queryKey: [
      "company-trips",
      companyId,
      query?.date,
      query?.status,
      query?.routeId,
      query?.assignmentStatus,
    ],
    queryFn: () => listTripsAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
