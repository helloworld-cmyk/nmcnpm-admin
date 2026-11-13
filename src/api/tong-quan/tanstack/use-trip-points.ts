"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTripPointsAPI } from "../api/get-trip-points";
import type {
  DashboardRangeQuery,
  DashboardTripPointResponse,
} from "../api/types";
import { ApiError } from "../../types";

type UseTripPointsOptions = Omit<
  UseQueryOptions<DashboardTripPointResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query tổng hợp chuyến theo ngày khởi hành; chỉ gọi khi có companyId. */
export function useTripPoints(
  companyId: string,
  query?: DashboardRangeQuery,
  options?: UseTripPointsOptions
) {
  return useQuery<DashboardTripPointResponse[], ApiError>({
    queryKey: ["company-trip-points", companyId, query?.from, query?.to],
    queryFn: () => getTripPointsAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
