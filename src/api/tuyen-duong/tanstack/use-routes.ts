"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listRoutesAPI } from "../api/list-routes";
import type { RouteResponse } from "../api/types";
import { ApiError } from "../../types";

type UseRoutesOptions = Omit<
  UseQueryOptions<RouteResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách tuyến của hãng; chỉ gọi khi có companyId. */
export function useRoutes(companyId: string, options?: UseRoutesOptions) {
  return useQuery<RouteResponse[], ApiError>({
    queryKey: ["company-routes", companyId],
    queryFn: () => listRoutesAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}