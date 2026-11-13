"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listCancelledTripsAPI } from "../api/list-cancelled-trips";
import type { TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCancelledTripsOptions = Omit<
  UseQueryOptions<TripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách chuyến CANCELLED/TERMINATED của hãng; chỉ gọi khi có companyId. */
export function useCancelledTrips(
  companyId: string,
  options?: UseCancelledTripsOptions
) {
  return useQuery<TripResponse[], ApiError>({
    queryKey: ["company-trips-cancelled", companyId],
    queryFn: () => listCancelledTripsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}
