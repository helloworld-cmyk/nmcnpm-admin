"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTodayTripsAPI } from "../api/get-today-trips";
import type {
  DashboardLimitQuery,
  DashboardTodayTripResponse,
} from "../api/types";
import { ApiError } from "../../types";

type UseTodayTripsOptions = Omit<
  UseQueryOptions<DashboardTodayTripResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chuyến hôm nay của hãng; chỉ gọi khi có companyId. */
export function useTodayTrips(
  companyId: string,
  query?: DashboardLimitQuery,
  options?: UseTodayTripsOptions
) {
  return useQuery<DashboardTodayTripResponse[], ApiError>({
    queryKey: ["company-today-trips", companyId, query?.limit],
    queryFn: () => getTodayTripsAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
