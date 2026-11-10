"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getRouteAPI } from "../api/get-route";
import type { RouteResponse } from "../api/types";
import { ApiError } from "../../types";

type UseRouteOptions = Omit<
  UseQueryOptions<RouteResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chi tiết tuyến theo id; chỉ gọi khi có đủ companyId và routeId. */
export function useRoute(
  companyId: string,
  routeId: string,
  options?: UseRouteOptions
) {
  return useQuery<RouteResponse, ApiError>({
    queryKey: ["company-route", companyId, routeId],
    queryFn: () => getRouteAPI(companyId, routeId),
    enabled: companyId.length > 0 && routeId.length > 0,
    ...options,
  });
}