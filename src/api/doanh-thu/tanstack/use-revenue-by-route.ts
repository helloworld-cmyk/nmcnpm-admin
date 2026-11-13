"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getRevenueByRouteAPI } from "../api/get-revenue-by-route";
import type { RevenueAnalyticsQuery, RevenueRouteResponse } from "../api/types";
import { ApiError } from "../../types";

type UseRevenueByRouteOptions = Omit<
  UseQueryOptions<RevenueRouteResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query thực thu theo tuyến của hãng; chỉ gọi khi có companyId. */
export function useRevenueByRoute(
  companyId: string,
  query?: RevenueAnalyticsQuery,
  options?: UseRevenueByRouteOptions
) {
  return useQuery<RevenueRouteResponse[], ApiError>({
    queryKey: [
      "company-revenue-by-route",
      companyId,
      query?.from,
      query?.to,
      query?.routeId,
    ],
    queryFn: () => getRevenueByRouteAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
