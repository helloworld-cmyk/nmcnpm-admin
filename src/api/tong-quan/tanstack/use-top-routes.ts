"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTopRoutesAPI } from "../api/get-top-routes";
import type { DashboardRouteResponse, TopRoutesQuery } from "../api/types";
import { ApiError } from "../../types";

type UseTopRoutesOptions = Omit<
  UseQueryOptions<DashboardRouteResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query top tuyến theo giá trị vé trong kỳ; chỉ gọi khi có companyId. */
export function useTopRoutes(
  companyId: string,
  query?: TopRoutesQuery,
  options?: UseTopRoutesOptions
) {
  return useQuery<DashboardRouteResponse[], ApiError>({
    queryKey: [
      "company-top-routes",
      companyId,
      query?.from,
      query?.to,
      query?.limit,
    ],
    queryFn: () => getTopRoutesAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
