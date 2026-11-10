"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listTripsAPI } from "../api/list-trips";
import type { TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseTripsOptions = Omit<
  UseQueryOptions<TripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách chuyến của hãng; chỉ gọi khi có companyId. */
export function useTrips(companyId: string, options?: UseTripsOptions) {
  return useQuery<TripResponse[], ApiError>({
    queryKey: ["company-trips", companyId],
    queryFn: () => listTripsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}